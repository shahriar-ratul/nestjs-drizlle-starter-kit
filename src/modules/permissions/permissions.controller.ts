import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  SetMetadata,
  Query,
  Put,
  BadRequestException,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { AbilityGuard } from '@/modules/auth/ability/ability.guard';
import { ApiResponse } from '@nestjs/swagger';
import { PageDto, PageOptionsDto } from '@/core/dto';
import { PermissionModel } from './entities/permission.entity';

@UseGuards(JwtAuthGuard)
@UseGuards(AbilityGuard)
@Controller({ version: '1', path: 'permissions' })
export class PermissionsController {
  constructor(private readonly _permissionsService: PermissionsService) {}

  @Get()
  @ApiResponse({})
  @SetMetadata('permissions', ['permission.view'])
  async findAll(@Query() pageOptionsDto: PageOptionsDto): Promise<PageDto<PermissionModel>> {
    return await this._permissionsService.findAll(pageOptionsDto);
  }

  @Post()
  @ApiResponse({ type: PermissionModel })
  @SetMetadata('permissions', ['permission.create'])
  async create(@Body() createDto: CreatePermissionDto) {
    return this._permissionsService.create(createDto);
  }

  @Get(':id')
  @ApiResponse({})
  @SetMetadata('permissions', ['permission.view'])
  async findOne(@Param('id') id: number): Promise<{ message: string; item: PermissionModel }> {
    const numberId = Number(id);

    if (isNaN(numberId)) {
      throw new BadRequestException('Invalid ID');
    }

    return this._permissionsService.findById(numberId);
  }

  @Put(':id')
  @ApiResponse({})
  @SetMetadata('permissions', ['permission.update'])
  async update(@Param('id') id: number, @Body() updateDto: UpdatePermissionDto) {
    return this._permissionsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiResponse({})
  @SetMetadata('permissions', ['permission.delete'])
  async remove(@Param('id') id: number) {
    return this._permissionsService.remove(id);
  }

  @Post(':id/restore')
  @ApiResponse({})
  @SetMetadata('permissions', ['permission.restore'])
  async restore(@Param('id') id: number) {
    return this._permissionsService.restore(id);
  }

  @Delete(':id/force-delete')
  @ApiResponse({})
  @SetMetadata('permissions', ['permission.delete'])
  async forceDelete(@Param('id') id: number) {
    return this._permissionsService.forceDelete(id);
  }

  @Get(':id/details')
  @ApiResponse({})
  @SetMetadata('permissions', ['permission.view'])
  async getDetails(@Param('id') id: number) {
    return this._permissionsService.findOne(id);
  }

  @Post(':id/status')
  @ApiResponse({})
  @SetMetadata('permissions', ['permission.status'])
  async changeStatus(@Param('id') id: number) {
    return this._permissionsService.changeStatus(+id);
  }
}
