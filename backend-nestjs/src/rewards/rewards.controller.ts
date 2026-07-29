import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Rewards')
@Controller('rewards')
export class RewardsController {
  constructor(private rewardsService: RewardsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List active rewards' })
  async findAll() {
    return this.rewardsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create reward with optional image (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() dto: CreateRewardDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.rewardsService.create(dto, file);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update reward with optional new image (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRewardDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.rewardsService.update(id, dto, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete reward (Admin only)' })
  async remove(@Param('id') id: string) {
    return this.rewardsService.remove(id);
  }
}
