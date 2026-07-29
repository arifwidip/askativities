import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class DeductPointsDto {
  @ApiProperty({ example: 10, description: 'Points amount to deduct' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 'Pengurangan poin karena melanggar aturan' })
  @IsString()
  @IsNotEmpty()
  title: string;
}
