import { relations } from 'drizzle-orm';
import { boolean, date, integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  dob: timestamp('dob', { withTimezone: true }),
  phone: varchar('phone', { length: 255 }).unique(),
  username: varchar('username', { length: 255 }).unique(),
  email: varchar('email', { length: 255 }).unique(),
  password: varchar('password', { length: 255 }).notNull(),
  photo: varchar('photo', { length: 255 }),
  joinedDate: timestamp('joined_date', { withTimezone: true }).defaultNow(),
  gender: varchar('gender', { length: 255 }),
  lastLogin: timestamp('last_login', { withTimezone: true }),
  isVerified: boolean('is_verified').default(false),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  verifiedByEmail: boolean('verified_by_email').default(false),
  verifiedByPhone: boolean('verified_by_phone').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),

  createdBy: integer('created_by').references(() => admins.id),
  updatedBy: integer('updated_by').references(() => admins.id),

  isDeleted: boolean('is_deleted').default(false),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: integer('deleted_by').references(() => admins.id),
  deletedReason: varchar('deleted_reason', { length: 255 }),
});

export const permissions = pgTable('permissions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  group: varchar('group', { length: 255 }).notNull(),
  groupOrder: integer('group_order').notNull(),
  order: integer('order').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  isDeleted: boolean('is_deleted').default(false),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: integer('deleted_by').references(() => admins.id),
  deletedReason: varchar('deleted_reason', { length: 255 }),
});

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  description: text('description'),
  isDefault: boolean('is_default').default(false),
  isActive: boolean('is_active').default(true),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  isDeleted: boolean('is_deleted').default(false),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: integer('deleted_by').references(() => admins.id),
  deletedReason: varchar('deleted_reason', { length: 255 }),
});

export const adminRole = pgTable('admin_role', {
  adminId: integer('admin_id').references(() => admins.id),
  roleId: integer('role_id').references(() => roles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const adminPermission = pgTable('admin_permission', {
  adminId: integer('admin_id').references(() => admins.id),
  permissionId: integer('permission_id').references(() => permissions.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const adminToken = pgTable('admin_token', {
  id: serial('id').primaryKey(),
  adminId: integer('admin_id').references(() => admins.id),
  token: text('token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  ip: varchar('ip', { length: 100 }).notNull(),
  userAgent: text('user_agent').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  isRevoked: boolean('is_revoked').default(false),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  revokedBy: integer('revoked_by').references(() => admins.id),
  revokedByIp: varchar('revoked_ip', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const permissionRole = pgTable('permission_role', {
  permissionId: integer('permission_id').references(() => permissions.id),
  roleId: integer('role_id').references(() => roles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const adminsRelations = relations(admins, ({ one, many }) => ({
  createdByAdmin: one(admins, {
    fields: [admins.createdBy],
    references: [admins.id],
    relationName: 'createdByAdmin',
  }),
  updatedByAdmin: one(admins, {
    fields: [admins.updatedBy],
    references: [admins.id],
    relationName: 'updatedByAdmin',
  }),
  deletedByAdmin: one(admins, {
    fields: [admins.deletedBy],
    references: [admins.id],
    relationName: 'deletedByAdmin',
  }),
  roles: many(adminRole),
  permissions: many(adminPermission),
  tokens: many(adminToken, {
    relationName: 'admin',
  }),
  revokedByAdmin: many(adminToken, {
    relationName: 'revokedByAdmin',
  }),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
  roles: many(adminRole, {
    relationName: 'roles',
  }),
  permissions: many(permissionRole),
  admins: many(adminRole, {
    relationName: 'admins',
  }),
}));

export const permissionsRelations = relations(permissions, ({ one, many }) => ({
  permissions: many(adminPermission),
  roles: many(permissionRole),
  admins: many(adminPermission),
}));

export const adminRoleRelations = relations(adminRole, ({ one }) => ({
  admin: one(admins, {
    fields: [adminRole.adminId],
    references: [admins.id],
    relationName: 'admins',
  }),
  role: one(roles, {
    fields: [adminRole.roleId],
    references: [roles.id],
    relationName: 'roles',
  }),
}));

export const adminsPermissionRelations = relations(adminPermission, ({ one }) => ({
  admin: one(admins, {
    fields: [adminPermission.adminId],
    references: [admins.id],
    relationName: 'admins',
  }),
  permission: one(permissions, {
    fields: [adminPermission.permissionId],
    references: [permissions.id],
    relationName: 'permissions',
  }),
}));

export const permissionRoleRelations = relations(permissionRole, ({ one }) => ({
  permission: one(permissions, {
    fields: [permissionRole.permissionId],
    references: [permissions.id],
    relationName: 'permissions',
  }),
  role: one(roles, {
    fields: [permissionRole.roleId],
    references: [roles.id],
    relationName: 'roles',
  }),
}));

export const adminTokenRelations = relations(adminToken, ({ one }) => ({
  admin: one(admins, {
    fields: [adminToken.adminId],
    references: [admins.id],
    relationName: 'admin',
  }),
  revokedByAdmin: one(admins, {
    fields: [adminToken.revokedBy],
    references: [admins.id],
    relationName: 'revokedByAdmin',
  }),
}));

export type Admin = typeof admins.$inferSelect;
export type AdminWithRoles = typeof admins.$inferSelect & {
  roles: (typeof adminRole.$inferSelect & {
    role: typeof roles.$inferSelect;
  })[];
};
export type Role = typeof roles.$inferSelect;

export type RoleWithPermissions = typeof roles.$inferSelect & {
  permissions: (typeof permissionRole.$inferSelect & {
    permission: typeof permissions.$inferSelect;
  })[];
  admins: (typeof adminRole.$inferSelect & {
    admin: typeof admins.$inferSelect;
  })[];
};

export type Permission = typeof permissions.$inferSelect;
export type AdminToken = typeof adminToken.$inferSelect;
