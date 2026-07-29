import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.activity.findMany({
      where: { isDeleted: false },
      orderBy: { points: 'asc' },
    });
  }

  async create(dto: CreateActivityDto) {
    return this.prisma.activity.create({
      data: {
        name: dto.name,
        description: dto.description,
        icon: dto.icon,
        points: dto.points,
      },
    });
  }

  async update(id: string, dto: UpdateActivityDto) {
    const activity = await this.prisma.activity.findUnique({ where: { id } });
    if (!activity || activity.isDeleted) {
      throw new NotFoundException('Activity not found.');
    }

    return this.prisma.activity.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.points !== undefined && { points: dto.points }),
      },
    });
  }

  async remove(id: string) {
    const activity = await this.prisma.activity.findUnique({ where: { id } });
    if (!activity || activity.isDeleted) {
      throw new NotFoundException('Activity not found.');
    }

    await this.prisma.activity.update({
      where: { id },
      data: { isDeleted: true },
    });

    return { message: 'Activity deleted successfully (soft deleted).' };
  }
}
