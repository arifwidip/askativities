import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Activities')
@Controller('activities')
export class ActivitiesController {
  constructor(private activitiesService: ActivitiesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List active activities' })
  async findAll() {
    return this.activitiesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create activity (Admin only)' })
  async create(@Body() dto: CreateActivityDto) {
    return this.activitiesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update activity (Admin only)' })
  async update(@Param('id') id: string, @Body() dto: UpdateActivityDto) {
    return this.activitiesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete activity (Admin only)' })
  async remove(@Param('id') id: string) {
    return this.activitiesService.remove(id);
  }
}
