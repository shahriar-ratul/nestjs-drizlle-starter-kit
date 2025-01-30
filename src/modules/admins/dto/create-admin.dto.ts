import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({
    type: 'string',
    example: 'admin@admin.com',
    description: 'admin email',
  })
  @IsEmail()
  @MaxLength(100)
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    type: 'string',
    example: '123456',
    description: 'admin password',
  })
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(255)
  password: string;

  @ApiProperty({
    type: 'string',
    example: 'phone',
    description: 'admin phone',
  })
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(255)
  phone: string;

  @ApiProperty({
    type: 'string',
    example: 'admin',
    description: 'admin username',
  })
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  username: string;

  @ApiProperty({
    type: 'string',
    example: 'admin',
    description: 'admin firstName',
  })
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  firstName: string;

  @ApiProperty({
    type: 'string',
    example: 'admin',
    description: 'admin lastName',
  })
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  lastName: string;

  @ApiProperty({
    type: 'string',
    example: 'true',
    description: 'admin isActive',
  })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  isActive: string;

  // dob
  @ApiProperty({
    type: 'string',
    example: '2024-01-01',
    description: 'admin dob',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const date = JSON.parse(value);
      return new Date(date);
    }
    return value;
  })
  @IsOptional()
  @IsDate()
  dob: Date;

  // joinedDate
  @ApiProperty({
    type: 'string',
    example: '2024-01-01 00:00:00',
    description: 'admin joinedDate',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const date = JSON.parse(value);
      return new Date(date);
    }
    return value;
  })
  @IsOptional()
  @IsDate()
  joinedDate: Date;

  @ApiProperty({
    type: 'array',
    example: 'roles',
    description: 'admin roles',
    isArray: true,
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const roles = JSON.parse(value);
      return roles.map((role: string) => Number(role));
    }
    return value;
  })
  @IsArray()
  @ArrayNotEmpty({
    message: 'At least 1 role is required',
  })
  roles: number[];

  @ApiProperty({
    type: 'string',
    example: '1',
    description: 'admin createdBy',
  })
  @IsNotEmpty()
  @IsString()
  createdBy: string;

  @ApiProperty({
    type: 'string',
    example: '1',
    description: 'admin updatedBy',
  })
  @IsOptional()
  @IsString()
  updatedBy?: string;

  @ApiProperty({
    type: 'string',
    example: 'male',
    description: 'admin gender',
  })
  @IsNotEmpty()
  @IsString()
  gender: string;
}
