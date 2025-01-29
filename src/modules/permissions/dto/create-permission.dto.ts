import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'The name of the permission',
    example: 'Create User',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'The group of the permission',
    example: 'User',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  group: string;

  @ApiProperty({
    description: 'The group order of the permission',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  groupOrder: number;

  @ApiProperty({
    description: 'The order of the permission',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  order: number;

  @ApiProperty({
    description: 'The active status of the permission',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => {
    return value === 'true' || value === true || value === 1 ? true : false;
  })
  isActive: boolean;
}
