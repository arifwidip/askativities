import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateChildDto } from './dto/create-child.dto';
import { EarnPointsDto } from './dto/earn-points.dto';
import { RedeemPointsDto } from './dto/redeem-points.dto';
import { DeductPointsDto } from './dto/deduct-points.dto';
import { GetLogsQueryDto } from './dto/get-logs-query.dto';

@Injectable()
export class ChildrenService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async findAll() {
    return this.prisma.child.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const child = await this.prisma.child.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!child) {
      throw new NotFoundException('Child not found.');
    }

    return child;
  }

  async getChildLogs(id: string, query: GetLogsQueryDto) {
    const { cursor, limit = 15 } = query;

    const child = await this.prisma.child.findUnique({ where: { id } });
    if (!child) {
      throw new NotFoundException('Child not found.');
    }

    const [logs, total] = await this.prisma.$transaction([
      this.prisma.pointLog.findMany({
        where: { childId: id },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      }),
      this.prisma.pointLog.count({
        where: { childId: id },
      }),
    ]);

    const hasMore = logs.length > limit;
    if (hasMore) logs.pop();
    const nextCursor = hasMore && logs.length > 0 ? logs[logs.length - 1].id : null;

    return {
      logs,
      total,
      nextCursor,
      hasMore,
    };
  }

  async create(dto: CreateChildDto, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Avatar image file is required.');
    }

    const avatarUrl = await this.storageService.uploadFile(file);

    return this.prisma.child.create({
      data: {
        name: dto.name,
        avatarUrl,
        totalPoints: 0,
      },
    });
  }

  async remove(id: string) {
    const child = await this.prisma.child.findUnique({ where: { id } });
    if (!child) {
      throw new NotFoundException('Child not found.');
    }

    await this.prisma.child.delete({ where: { id } });
    return { message: 'Child deleted successfully.' };
  }

  async earnPoints(id: string, dto: EarnPointsDto) {
    const child = await this.prisma.child.findUnique({ where: { id } });
    if (!child) {
      throw new NotFoundException('Child not found.');
    }

    const activity = await this.prisma.activity.findUnique({ where: { id: dto.activityId } });
    if (!activity || activity.isDeleted) {
      throw new NotFoundException('Activity not found or deleted.');
    }

    const [updatedChild, log] = await this.prisma.$transaction([
      this.prisma.child.update({
        where: { id },
        data: {
          totalPoints: {
            increment: activity.points,
          },
        },
      }),
      this.prisma.pointLog.create({
        data: {
          childId: id,
          type: 'EARN',
          amount: activity.points,
          title: activity.name,
          activityId: activity.id,
        },
      }),
    ]);

    return {
      message: `Points added successfully! +${activity.points} pts`,
      child: updatedChild,
      log,
    };
  }

  async redeemPoints(id: string, dto: RedeemPointsDto) {
    const child = await this.prisma.child.findUnique({ where: { id } });
    if (!child) {
      throw new NotFoundException('Child not found.');
    }

    const reward = await this.prisma.reward.findUnique({ where: { id: dto.rewardId } });
    if (!reward || reward.isDeleted) {
      throw new NotFoundException('Reward not found or deleted.');
    }

    if (child.totalPoints < reward.cost) {
      throw new BadRequestException(
        `Insufficient points. Needs ${reward.cost} pts, has ${child.totalPoints} pts.`,
      );
    }

    const [updatedChild, log] = await this.prisma.$transaction([
      this.prisma.child.update({
        where: { id },
        data: {
          totalPoints: {
            decrement: reward.cost,
          },
        },
      }),
      this.prisma.pointLog.create({
        data: {
          childId: id,
          type: 'REDEEM',
          amount: reward.cost,
          title: reward.name,
          rewardId: reward.id,
        },
      }),
    ]);

    return {
      message: `Reward redeemed successfully! -${reward.cost} pts`,
      child: updatedChild,
      log,
    };
  }

  async deductPoints(id: string, dto: DeductPointsDto) {
    const child = await this.prisma.child.findUnique({ where: { id } });
    if (!child) {
      throw new NotFoundException('Child not found.');
    }

    if (child.totalPoints < dto.amount) {
      throw new BadRequestException(
        `Insufficient points. Cannot deduct ${dto.amount} pts, child only has ${child.totalPoints} pts.`,
      );
    }

    const [updatedChild, log] = await this.prisma.$transaction([
      this.prisma.child.update({
        where: { id },
        data: {
          totalPoints: {
            decrement: dto.amount,
          },
        },
      }),
      this.prisma.pointLog.create({
        data: {
          childId: id,
          type: 'DEDUCT',
          amount: dto.amount,
          title: dto.title,
        },
      }),
    ]);

    return {
      message: `Points deducted successfully! -${dto.amount} pts`,
      child: updatedChild,
      log,
    };
  }

  async revokeLog(childId: string, logId: string) {
    const log = await this.prisma.pointLog.findFirst({
      where: { id: logId, childId },
    });

    if (!log) {
      throw new NotFoundException('Point log not found for this child.');
    }

    const child = await this.prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child) {
      throw new NotFoundException('Child not found.');
    }

    let newPoints = child.totalPoints;
    if (log.type === 'EARN') {
      newPoints = Math.max(0, child.totalPoints - log.amount);
    } else if (log.type === 'REDEEM' || log.type === 'DEDUCT') {
      newPoints = child.totalPoints + log.amount;
    }

    const [updatedChild] = await this.prisma.$transaction([
      this.prisma.child.update({
        where: { id: childId },
        data: { totalPoints: newPoints },
      }),
      this.prisma.pointLog.delete({
        where: { id: logId },
      }),
    ]);

    return {
      message: 'Point transaction revoked successfully.',
      child: updatedChild,
    };
  }
}
