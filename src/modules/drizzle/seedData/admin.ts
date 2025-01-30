import { SQL, sql } from 'drizzle-orm';

export const adminSeeds: Admin[] = [
  {
    email: 'superadmin@admin.com',
    username: 'super_admin',
    password: 'password',
    isActive: true,
    dob: sql`DATE '1990-01-01'`,
    phone: 'super_admin',
    firstName: 'Super',
    lastName: 'Admin',
    gender: 'male',
    joinedDate: sql`CURRENT_TIMESTAMP`,
    isVerified: true,
    verifiedAt: sql`CURRENT_TIMESTAMP`,
    verifiedByEmail: true,
    verifiedByPhone: true,
  },
  {
    email: 'admin@admin.com',
    username: 'admin',
    password: 'password',
    isActive: true,
    dob: sql`DATE '1990-01-01'`,
    phone: 'admin',
    firstName: 'Admin',
    lastName: 'Admin',
    gender: 'male',
    joinedDate: sql`CURRENT_TIMESTAMP`,
    isVerified: true,
    verifiedAt: sql`CURRENT_TIMESTAMP`,
    verifiedByEmail: true,
    verifiedByPhone: true,
  },
  {
    email: 'editor@admin.com',
    username: 'editor',
    password: 'password',
    isActive: true,
    dob: sql`DATE '1990-01-01'`,
    phone: 'editor',
    firstName: 'Editor',
    lastName: 'Editor',
    gender: 'male',
    joinedDate: sql`CURRENT_TIMESTAMP`,
    isVerified: true,
    verifiedAt: sql`CURRENT_TIMESTAMP`,
    verifiedByEmail: true,
    verifiedByPhone: true,
  },
  {
    email: 'user@admin.com',
    username: 'user',
    password: 'password',
    isActive: true,
    dob: sql`DATE '1990-01-01'`,
    phone: 'user',
    firstName: 'User',
    lastName: 'User',
    gender: 'male',
    joinedDate: sql`CURRENT_TIMESTAMP`,
    isVerified: true,
    verifiedAt: sql`CURRENT_TIMESTAMP`,
    verifiedByEmail: true,
    verifiedByPhone: true,
  },
];

interface Admin {
  firstName: string;
  lastName: string;
  dob: SQL<unknown>;
  phone: string;
  email: string;
  gender: string;
  joinedDate: SQL<unknown>;
  username: string;
  password: string;
  isActive: boolean;
  isVerified: boolean;
  verifiedAt: SQL<unknown>;
  verifiedByEmail: boolean;
  verifiedByPhone: boolean;
}
