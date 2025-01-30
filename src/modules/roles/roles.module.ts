import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { AuthModule } from '../auth/auth.module';
import { RoleModuleController } from './list/role-module.controller';

@Module({
  imports: [DrizzleModule, AuthModule],
  controllers: [RolesController, RoleModuleController],
  providers: [RolesService],
})
export class RolesModule {}
