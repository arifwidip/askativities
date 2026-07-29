import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateActivityDto {
  @ApiProperty({ example: 'Membaca Buku' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Membaca buku selama 20 menit' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'book-open' })
  @IsString()
  @IsNotEmpty()
  icon: string;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  points: number;
}
