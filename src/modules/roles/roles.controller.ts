import { Controller, Get, Post, Body, Param, Delete, UseGuards, SetMetadata, Query, Put } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { AbilityGuard } from '@/modules/auth/ability/ability.guard';
import { ApiResponse } from '@nestjs/swagger';
import { PageDto } from '@/core/dto/page.dto';
import { PageOptionsDto } from '@/core/dto/page-options.dto';
import { Role } from '../drizzle/schema/admin-module.schema';

@UseGuards(JwtAuthGuard)
@UseGuards(AbilityGuard)
@Controller({ version: '1', path: 'roles' })
export class RolesController {
  constructor(private readonly _rolesService: RolesService) {}

  @Get()
  @ApiResponse({})
  @SetMetadata('permissions', ['role.view'])
  async findAll(@Query() pageOptionsDto: PageOptionsDto): Promise<PageDto<Role>> {
    return await this._rolesService.findAll(pageOptionsDto);
  }

  @Post()
  @ApiResponse({})
  @SetMetadata('permissions', ['role.create'])
  create(@Body() createRoleDto: CreateRoleDto) {
    return this._rolesService.create(createRoleDto);
  }

  @Get(':id')
  @ApiResponse({})
  @SetMetadata('permissions', ['role.view'])
  async findOne(@Param('id') id: number) {
    return this._rolesService.findOne(id);
  }

  @Put(':id')
  @ApiResponse({})
  @SetMetadata('permissions', ['role.update'])
  async update(@Param('id') id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this._rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiResponse({})
  @SetMetadata('permissions', ['role.delete'])
  async remove(@Param('id') id: number) {
    return this._rolesService.remove(id);
  }

  @Post(':id/status')
  @ApiResponse({})
  @SetMetadata('permissions', ['role.status'])
  async changeStatus(@Param('id') id: number) {
    return this._rolesService.changeStatus(+id);
  }
}
