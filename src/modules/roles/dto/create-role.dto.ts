import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    type: 'string',
    example: 'Admin',
    description: 'The name of the role',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    type: 'string',
    example: 'Admin role',
    description: 'The description of the role',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  description: string;

  @ApiProperty({
    type: 'boolean',
    example: true,
    description: 'The status of the role',
  })
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      if (value === 'true' || value === '1') {
        return true;
      } else if (value === 'false' || value === '0') {
        return false;
      }
    }
    return value;
  })
  isActive: boolean;

  @ApiProperty({
    type: 'boolean',
    example: false,
    description: 'The default status of the role',
  })
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      if (value === 'true' || value === '1') {
        return true;
      } else if (value === 'false' || value === '0') {
        return false;
      }
    }
    return value;
  })
  isDefault: boolean;

  @ApiProperty({
    type: 'array',
    example: 'permissions id',
    description: 'The permissions of the role',
    isArray: true,
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const permissions = JSON.parse(value);
      return permissions.map((permission: string) => Number(permission));
    }
    return value;
  })
  @IsArray()
  @ArrayNotEmpty({
    message: 'At least 1 permission is required',
  })
  permissions: number[];
}
