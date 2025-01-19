export const roleSeeds: Role[] = [
  {
    name: 'Super Admin',
    slug: 'superadmin',
    description: 'Super Admin Role',
    isDefault: true,
  },

  {
    name: 'Admin',
    slug: 'admin',
    description: 'Admin Role',
    isDefault: false,
  },

  {
    name: 'Editor',
    slug: 'editor',
    description: 'Editor Role',
    isDefault: false,
  },
  {
    name: 'User',
    slug: 'user',
    description: 'User Role',
    isDefault: false,
  },
];

interface Role {
  name: string;
  slug: string;
  description: string;
  isDefault: boolean;
}
