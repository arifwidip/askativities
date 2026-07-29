import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChildrenService } from './children.service';
import { CreateChildDto } from './dto/create-child.dto';
import { EarnPointsDto } from './dto/earn-points.dto';
import { RedeemPointsDto } from './dto/redeem-points.dto';
import { DeductPointsDto } from './dto/deduct-points.dto';
import { GetLogsQueryDto } from './dto/get-logs-query.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Children')
@Controller('children')
export class ChildrenController {
  constructor(private childrenService: ChildrenService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all children' })
  async findAll() {
    return this.childrenService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get child details and recent logs' })
  async findOne(@Param('id') id: string) {
    return this.childrenService.findOne(id);
  }

  @Public()
  @Get(':id/logs')
  @ApiOperation({ summary: 'Get paginated logs for a child' })
  async getChildLogs(@Param('id') id: string, @Query() query: GetLogsQueryDto) {
    return this.childrenService.getChildLogs(id, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create child with avatar upload (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  async create(
    @Body() dto: CreateChildDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.childrenService.create(dto, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete child (Admin only)' })
  async remove(@Param('id') id: string) {
    return this.childrenService.remove(id);
  }

  @Public()
  @Post(':id/earn')
  @ApiOperation({ summary: 'Earn points for an activity' })
  async earnPoints(@Param('id') id: string, @Body() dto: EarnPointsDto) {
    return this.childrenService.earnPoints(id, dto);
  }

  @Public()
  @Post(':id/redeem')
  @ApiOperation({ summary: 'Redeem points for a reward' })
  async redeemPoints(@Param('id') id: string, @Body() dto: RedeemPointsDto) {
    return this.childrenService.redeemPoints(id, dto);
  }

  @Post(':id/deduct')
  @ApiOperation({ summary: 'Deduct points penalty/correction (Admin only)' })
  async deductPoints(@Param('id') id: string, @Body() dto: DeductPointsDto) {
    return this.childrenService.deductPoints(id, dto);
  }

  @Delete(':childId/logs/:logId')
  @ApiOperation({ summary: 'Revoke a point log (Admin only)' })
  async revokeLog(
    @Param('childId') childId: string,
    @Param('logId') logId: string,
  ) {
    return this.childrenService.revokeLog(childId, logId);
  }
}
