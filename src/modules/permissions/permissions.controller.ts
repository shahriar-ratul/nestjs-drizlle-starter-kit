import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, SetMetadata, Query, Put } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { AbilityGuard } from '@/modules/auth/ability/ability.guard';
import { ApiResponse } from '@nestjs/swagger';
import { PageDto, PageOptionsDto } from '@/core/dto';
import { Permission } from '@/modules/drizzle/schema/admin-module.schema';

@UseGuards(JwtAuthGuard)
@UseGuards(AbilityGuard)
@Controller({ version: '1', path: 'permissions' })
export class PermissionsController {
  constructor(private readonly _permissionsService: PermissionsService) {}

  @Get()
  @ApiResponse({})
  @SetMetadata('permissions', ['role.view'])
  async findAll(@Query() pageOptionsDto: PageOptionsDto): Promise<PageDto<Permission>> {
    return await this._permissionsService.findAll(pageOptionsDto);
  }

  @Post()
  @ApiResponse({})
  @SetMetadata('permissions', ['role.create'])
  create(@Body() createDto: CreatePermissionDto) {
    return this._permissionsService.create(createDto);
  }

  @Get(':id')
  @ApiResponse({})
  @SetMetadata('permissions', ['role.view'])
  async findOne(@Param('id') id: number) {
    return this._permissionsService.findOne(id);
  }

  @Put(':id')
  @ApiResponse({})
  @SetMetadata('permissions', ['role.update'])
  async update(@Param('id') id: number, @Body() updateDto: UpdatePermissionDto) {
    return this._permissionsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiResponse({})
  @SetMetadata('permissions', ['role.delete'])
  async remove(@Param('id') id: number) {
    return this._permissionsService.remove(id);
  }
}
