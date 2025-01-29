import { AbilityGuard } from '@/modules/auth/ability/ability.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { Controller, Get, SetMetadata, UseGuards } from '@nestjs/common';

import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PermissionsService } from '../permissions.service';

@ApiTags('common')
@Controller({
  version: '1',
  path: 'common',
})
@UseGuards(JwtAuthGuard)
@UseGuards(AbilityGuard)
export class PermissionModuleController {
  constructor(private readonly _permissionsService: PermissionsService) {}

  // common/all-permissions
  @ApiResponse({})
  @Get('/all-permissions')
  @SetMetadata('permissions', ['permission.view'])
  async getAllPermissions() {
    return this._permissionsService.getAllPermissions();
  }
}
