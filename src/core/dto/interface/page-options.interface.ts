import { Order } from '@/core/constants';

export interface AbstractPageOptionsDto {
  readonly order: Order;
  readonly page: number;
  readonly limit: number;
  readonly search: string | undefined;
  readonly sort: string;
  readonly isActive: string | undefined;
  readonly isDeleted: string | undefined;
}
