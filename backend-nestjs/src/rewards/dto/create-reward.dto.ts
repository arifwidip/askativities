import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRewardDto {
  @ApiProperty({ example: 'Main Game 30 Menit' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Bermain game di HP/Tablet' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'gamepad' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: 20 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  cost: number;
}
