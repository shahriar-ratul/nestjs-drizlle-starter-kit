import { Module } from '@nestjs/common';
import { AdminsService } from './services/admins.service';
import { AdminsController } from './controllers/admins.controller';
import { AuthModule } from '@/modules/auth/auth.module';
import { DrizzleModule } from '@/modules/drizzle/drizzle.module';
import { AdminModuleController } from './list/admin-module.controller';

@Module({
  imports: [AuthModule, DrizzleModule],
  controllers: [AdminsController, AdminModuleController],
  providers: [AdminsService],
})
export class AdminsModule {}
