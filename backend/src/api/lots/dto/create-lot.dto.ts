import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsString, Min, IsDate, } from 'class-validator';

export class CreateLotDto {
  @ApiProperty({ example: 'Vintage Guitar' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Gibson Les Paul 1959', required: false })
  @IsString()
  description?: string;

  @Type(() => Number)
  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  startPrice: number;

@IsDateString()
@IsNotEmpty()
endTime: string;
}