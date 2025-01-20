import { AbilityGuard } from '@/modules/auth/ability/ability.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { Controller, Get, SetMetadata, UseGuards } from '@nestjs/common';

import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminsService } from '../services/admins.service';

@ApiTags('common')
@Controller({
  version: '1',
  path: 'common',
})
@UseGuards(JwtAuthGuard)
@UseGuards(AbilityGuard)
export class AdminModuleController {
  constructor(private readonly _adminsService: AdminsService) {}

  // common/all-admins
  @ApiResponse({})
  @Get('/all-admins')
  @SetMetadata('permissions', ['admin.view'])
  async getAllAdmins() {
    return this._adminsService.getAllAdmins();
  }
}
