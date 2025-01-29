interface Permission {
  name: string;
  slug: string;
  group: string;
  groupOrder: number;
  order: number;
}

export const permissionSeeds: Permission[] = [
  {
    name: 'Admin Dashboard',
    slug: 'admin.dashboard',
    group: 'dashboard',
    groupOrder: 1,
    order: 1,
  },
  // modules
  {
    name: 'Admin Module',
    slug: 'admin.module',
    group: 'module',
    groupOrder: 2,
    order: 1,
  },
  {
    name: 'User Module',
    slug: 'user.module',
    group: 'module',
    groupOrder: 2,
    order: 2,
  },
  {
    name: 'Role & Permission Module',
    slug: 'role.permission.module',
    group: 'module',
    groupOrder: 2,
    order: 3,
  },
  {
    name: 'Kanban Module',
    slug: 'kanban.module',
    group: 'module',
    groupOrder: 2,
    order: 4,
  },

  // admin
  {
    name: 'Admin View',
    slug: 'admin.view',
    group: 'admin',
    groupOrder: 3,
    order: 1,
  },

  {
    name: 'Admin Create',
    slug: 'admin.create',
    group: 'admin',
    groupOrder: 3,
    order: 2,
  },

  {
    name: 'Admin Update',
    slug: 'admin.update',
    group: 'admin',
    groupOrder: 3,
    order: 3,
  },

  {
    name: 'Admin Delete',
    slug: 'admin.delete',
    group: 'admin',
    groupOrder: 3,
    order: 4,
  },
  {
    name: 'Admin Status',
    slug: 'admin.status',
    group: 'admin',
    groupOrder: 3,
    order: 5,
  },
  {
    name: 'Admin Restore',
    slug: 'admin.restore',
    group: 'admin',
    groupOrder: 3,
    order: 6,
  },
  {
    name: 'Admin Force Delete',
    slug: 'admin.force-delete',
    group: 'admin',
    groupOrder: 3,
    order: 7,
  },

  // role
  {
    name: 'Role View',
    slug: 'role.view',
    group: 'role',
    groupOrder: 4,
    order: 1,
  },
  {
    name: 'Role Create',
    slug: 'role.create',
    group: 'role',
    groupOrder: 4,
    order: 2,
  },
  {
    name: 'Role Update',
    slug: 'role.update',
    group: 'role',
    groupOrder: 4,
    order: 3,
  },
  {
    name: 'Role Delete',
    slug: 'role.delete',
    group: 'role',
    groupOrder: 4,
    order: 4,
  },
  {
    name: 'Role Status',
    slug: 'role.status',
    group: 'role',
    groupOrder: 4,
    order: 5,
  },
  {
    name: 'Role Restore',
    slug: 'role.restore',
    group: 'role',
    groupOrder: 4,
    order: 6,
  },
  {
    name: 'Role Force Delete',
    slug: 'role.force-delete',
    group: 'role',
    groupOrder: 4,
    order: 7,
  },

  // permission
  {
    name: 'permission View',
    slug: 'permission.view',
    group: 'permission',
    groupOrder: 5,
    order: 1,
  },
  {
    name: 'permission Create',
    slug: 'permission.create',
    group: 'permission',
    groupOrder: 5,
    order: 2,
  },
  {
    name: 'permission Update',
    slug: 'permission.update',
    group: 'permission',
    groupOrder: 5,
    order: 3,
  },
  {
    name: 'permission Delete',
    slug: 'permission.delete',
    group: 'permission',
    groupOrder: 5,
    order: 4,
  },
  {
    name: 'permission Status',
    slug: 'permission.status',
    group: 'permission',
    groupOrder: 5,
    order: 5,
  },
  {
    name: 'permission Group Order',
    slug: 'permission.group.order',
    group: 'permission',
    groupOrder: 5,
    order: 6,
  },
  {
    name: 'permission Order',
    slug: 'permission.order',
    group: 'permission',
    groupOrder: 5,
    order: 7,
  },
  {
    name: 'permission Restore',
    slug: 'permission.restore',
    group: 'permission',
    groupOrder: 5,
    order: 8,
  },
  {
    name: 'permission Force Delete',
    slug: 'permission.force-delete',
    group: 'permission',
    groupOrder: 5,
    order: 9,
  },

  // profile
  {
    name: 'Profile View',
    slug: 'profile.view',
    group: 'profile',
    groupOrder: 6,
    order: 1,
  },

  {
    name: 'Profile Update',
    slug: 'profile.update',
    group: 'profile',
    groupOrder: 6,
    order: 2,
  },

  // kanban
  {
    name: 'Kanban View',
    slug: 'kanban.view',
    group: 'kanban',
    groupOrder: 7,
    order: 1,
  },
  {
    name: 'Kanban Create',
    slug: 'kanban.create',
    group: 'kanban',
    groupOrder: 7,
    order: 2,
  },
  {
    name: 'Kanban Update',
    slug: 'kanban.update',
    group: 'kanban',
    groupOrder: 7,
    order: 3,
  },
  {
    name: 'Kanban Delete',
    slug: 'kanban.delete',
    group: 'kanban',
    groupOrder: 7,
    order: 4,
  },
  {
    name: 'Kanban Status',
    slug: 'kanban.status',
    group: 'kanban',
    groupOrder: 7,
    order: 5,
  },
  {
    name: 'Kanban Restore',
    slug: 'kanban.restore',
    group: 'kanban',
    groupOrder: 7,
    order: 6,
  },
  {
    name: 'Kanban Force Delete',
    slug: 'kanban.force-delete',
    group: 'kanban',
    groupOrder: 7,
    order: 7,
  },
];
