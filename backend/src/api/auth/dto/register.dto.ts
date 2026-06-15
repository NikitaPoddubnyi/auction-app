import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class RegisterRequest {
  @ApiProperty({
    description: 'Name of user',
    example: 'John',
    type: String,
    required: true,
    minLength: 3,
    maxLength: 50,
  })
  @IsString({ message: 'Name should be a string' })
  @IsNotEmpty({ message: 'Name should not be empty' })
  @MinLength(3, { message: 'Name should be at least 3 characters' })
  @MaxLength(50, { message: 'Name should not exceed 50 characters' })
  firstName: string;

  @ApiProperty({
    description: 'Last name of user',
    example: 'Doe',
    type: String,
    required: true,
    minLength: 3,
    maxLength: 50,
  })
  @IsString({ message: 'Last name should be a string' })
  @IsNotEmpty({ message: 'Last name should not be empty' })
  @MinLength(3, { message: 'Last name should be at least 3 characters' })
  @MaxLength(50, { message: 'Last name should not exceed 50 characters' })
  lastName: string;

  @ApiProperty({
    description: 'Email of user',
    example: 'hM0aR@example.com',
    type: String,
    required: true,
  })
  @IsEmail()
  @IsNotEmpty({ message: 'Email should not be empty' })
  email: string;

  @ApiProperty({
    description: 'Password of user',
    example: 'rdgttsdv23',
    type: String,
    required: true,
    minLength: 6,
    maxLength: 128,
  })
  @IsString({ message: 'Password should be a string' })
  @IsNotEmpty({ message: 'Password should not be empty' })
  @MinLength(6, { message: 'Password should be at least 6 characters' })
  @MaxLength(128, { message: 'Password should not exceed 128 characters' })
  password: string;
}
