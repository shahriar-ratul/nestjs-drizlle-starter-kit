export class PermissionModel {
  id: number;
  name: string;
  slug: string;
  group: string;
  groupOrder: number;
  order: number;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}
