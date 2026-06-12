import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class CreateBidDto {
  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(0)
  amount: number;
}