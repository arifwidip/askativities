import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';

@Injectable()
export class RewardsService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async findAll() {
    return this.prisma.reward.findMany({
      where: { isDeleted: false },
      orderBy: { cost: 'asc' },
    });
  }

  async create(dto: CreateRewardDto, file?: Express.Multer.File) {
    let imageUrl = dto.icon || '🎁';
    if (file) {
      imageUrl = await this.storageService.uploadFile(file);
    }

    return this.prisma.reward.create({
      data: {
        name: dto.name,
        description: dto.description,
        icon: imageUrl,
        cost: dto.cost,
      },
    });
  }

  async update(id: string, dto: UpdateRewardDto, file?: Express.Multer.File) {
    const reward = await this.prisma.reward.findUnique({ where: { id } });
    if (!reward || reward.isDeleted) {
      throw new NotFoundException('Reward not found.');
    }

    let imageUrl = reward.icon;
    if (file) {
      imageUrl = await this.storageService.uploadFile(file);
    } else if (dto.icon !== undefined) {
      imageUrl = dto.icon;
    }

    return this.prisma.reward.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        icon: imageUrl,
        ...(dto.cost !== undefined && { cost: dto.cost }),
      },
    });
  }

  async remove(id: string) {
    const reward = await this.prisma.reward.findUnique({ where: { id } });
    if (!reward || reward.isDeleted) {
      throw new NotFoundException('Reward not found.');
    }

    await this.prisma.reward.update({
      where: { id },
      data: { isDeleted: true },
    });

    return { message: 'Reward deleted successfully (soft deleted).' };
  }
}
