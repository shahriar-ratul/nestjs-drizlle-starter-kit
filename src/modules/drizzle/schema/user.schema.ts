import { relations } from 'drizzle-orm';
import { boolean, date, integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  dob: date('dob'),
  gender: varchar('gender', { length: 255 }),
  phone: varchar('phone', { length: 255 }).unique(),
  username: varchar('username', { length: 255 }).unique(),
  email: varchar('email', { length: 255 }).unique(),
  password: varchar('password', { length: 255 }).notNull(),
  photo: varchar('photo', { length: 255 }),
  joinedDate: date('joined_date').defaultNow(),
  lastLogin: timestamp('last_login'),
  isActive: boolean('is_active').default(true),
  isVerified: boolean('is_verified').default(false),
  verifiedAt: timestamp('verified_at'),
  verifiedByEmail: boolean('verified_by_email').default(false),
  verifiedByPhone: boolean('verified_by_phone').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  isDeleted: boolean('is_deleted').default(false),
  deletedAt: timestamp('deleted_at'),
  deletedBy: integer('deleted_by').references(() => users.id),
  deletedReason: varchar('deleted_reason', { length: 255 }),
  referenceId: integer('reference_id').references(() => users.id),
  referenceType: varchar('reference_type', { length: 255 }),
  createdBy: integer('created_by').references(() => users.id),
  updatedBy: integer('updated_by').references(() => users.id),
});

export const userTokens = pgTable('user_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  token: text('token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  ip: varchar('ip', { length: 100 }).notNull(),
  userAgent: text('user_agent').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  isRevoked: boolean('is_revoked').default(false),
  revokedAt: timestamp('revoked_at'),
  revokedBy: integer('revoked_by').references(() => users.id),
  revokedByIp: varchar('revoked_ip', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userRelations = relations(users, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [users.createdBy],
    references: [users.id],
    relationName: 'createdBy',
  }),
  updatedBy: one(users, {
    fields: [users.updatedBy],
    references: [users.id],
    relationName: 'updatedBy',
  }),
  deletedBy: one(users, {
    fields: [users.deletedBy],
    references: [users.id],
    relationName: 'deletedBy',
  }),
  tokens: many(userTokens, {
    relationName: 'user',
  }),
  revokedBy: many(userTokens, {
    relationName: 'revokedBy',
  }),
}));

export const userTokensRelations = relations(userTokens, ({ one }) => ({
  user: one(users, {
    fields: [userTokens.userId],
    references: [users.id],
    relationName: 'user',
  }),
  revokedBy: one(users, {
    fields: [userTokens.revokedBy],
    references: [users.id],
    relationName: 'revokedBy',
  }),
}));

export type User = typeof users.$inferSelect;
