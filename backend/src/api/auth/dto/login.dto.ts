import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Customer email',
    example: 'hM0aR@example.com',
    type: String,
    required: true,
  })
  @IsEmail()
  @IsNotEmpty({ message: 'Email should not be empty' })
  email: string;

  @ApiProperty({
    description: 'Customer password',
    example: 'rdgttsdv23',
    type: String,
    required: true,
    minLength: 6,
    maxLength: 128,
  })
  @IsNotEmpty({ message: 'Password should not be empty' })
  @MinLength(6, { message: 'Password should be at least 6 characters' })
  @MaxLength(128, { message: 'Password should not exceed 128 characters' })
  password: string;
}
