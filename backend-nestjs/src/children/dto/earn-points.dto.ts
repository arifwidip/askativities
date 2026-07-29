import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EarnPointsDto {
  @ApiProperty({ example: 'activity-uuid' })
  @IsString()
  @IsNotEmpty()
  activityId: string;
}
