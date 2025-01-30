import { AbilityGuard } from '@/modules/auth/ability/ability.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { Controller, Get, SetMetadata, UseGuards } from '@nestjs/common';

import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesService } from '../roles.service';

@ApiTags('common')
@Controller({
  version: '1',
  path: 'common',
})
@UseGuards(JwtAuthGuard)
@UseGuards(AbilityGuard)
export class RoleModuleController {
  constructor(private readonly _rolesService: RolesService) {}

  // common/all-roles
  @ApiResponse({})
  @Get('/all-roles')
  @SetMetadata('permissions', ['role.view'])
  async getAllRoles() {
    return this._rolesService.getAllRoles();
  }
}
