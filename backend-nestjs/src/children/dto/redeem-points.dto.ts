import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RedeemPointsDto {
  @ApiProperty({ example: 'reward-uuid' })
  @IsString()
  @IsNotEmpty()
  rewardId: string;
}
