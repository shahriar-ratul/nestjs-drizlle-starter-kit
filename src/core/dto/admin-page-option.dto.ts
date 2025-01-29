import { ApiPropertyOptional } from '@nestjs/swagger';
import { Order } from '../constants';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AbstractPageOptionsDto } from './interface/page-options.interface';

export class AdminPageOptionsDto implements AbstractPageOptionsDto {
  @ApiPropertyOptional({ enum: Order, enumName: 'Order', default: Order.ASC })
  @IsEnum(Order)
  @IsOptional()
  readonly order: Order = Order.DESC;

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  @IsOptional()
  readonly limit: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  readonly search: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly sort: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly isActive: string | undefined;

  @ApiPropertyOptional()
  @IsOptional()
  readonly isDeleted: string | undefined;

  @ApiPropertyOptional()
  @IsOptional()
  readonly roles: string | undefined;
}
