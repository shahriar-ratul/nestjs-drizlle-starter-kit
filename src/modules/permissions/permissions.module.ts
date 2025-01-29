import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { DrizzleModule } from '@/modules/drizzle/drizzle.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { PermissionModuleController } from './list/permission-module.controller';
@Module({
  imports: [DrizzleModule, AuthModule],
  controllers: [PermissionsController, PermissionModuleController],
  providers: [PermissionsService],
})
export class PermissionsModule {}
