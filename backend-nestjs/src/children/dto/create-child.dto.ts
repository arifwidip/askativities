import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChildDto {
  @ApiProperty({ example: 'Budi' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
