import { users } from '@/modules/drizzle/schema/user.schema';
import { Exclude } from 'class-transformer';

export class AdminEntity {
  @Exclude()
  deleted: boolean;
  @Exclude()
  deletedBy: number | null;
  @Exclude()
  deletedAt: Date | null;
}
