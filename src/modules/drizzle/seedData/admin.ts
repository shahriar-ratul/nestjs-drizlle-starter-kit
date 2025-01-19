export const adminSeeds: Admin[] = [
  {
    email: 'superadmin@admin.com',
    username: 'super_admin',
    password: 'password',
    isActive: true,
    dob: new Date('1990-01-01'),
    phone: 'super_admin',
    firstName: 'Super',
    lastName: 'Admin',
    gender: 'male',
    joinedDate: new Date(),
    isVerified: true,
    verifiedAt: new Date(),
    verifiedByEmail: true,
    verifiedByPhone: true,
  },
  {
    email: 'admin@admin.com',
    username: 'admin',
    password: 'password',
    isActive: true,
    dob: new Date('1990-01-01'),
    phone: 'admin',
    firstName: 'Admin',
    lastName: 'Admin',
    gender: 'male',
    joinedDate: new Date(),
    isVerified: true,
    verifiedAt: new Date(),
    verifiedByEmail: true,
    verifiedByPhone: true,
  },
  {
    email: 'editor@admin.com',
    username: 'editor',
    password: 'password',
    isActive: true,
    dob: new Date('1990-01-01'),
    phone: 'editor',
    firstName: 'Editor',
    lastName: 'Editor',
    gender: 'male',
    joinedDate: new Date(),
    isVerified: true,
    verifiedAt: new Date(),
    verifiedByEmail: true,
    verifiedByPhone: true,
  },
  {
    email: 'user@admin.com',
    username: 'user',
    password: 'password',
    isActive: true,
    dob: new Date('1990-01-01'),
    phone: 'user',
    firstName: 'User',
    lastName: 'User',
    gender: 'male',
    joinedDate: new Date(),
    isVerified: true,
    verifiedAt: new Date(),
    verifiedByEmail: true,
    verifiedByPhone: true,
  },
];

interface Admin {
  firstName: string;
  lastName: string;
  dob: Date;
  phone: string;
  email: string;
  gender: string;
  joinedDate: Date;
  username: string;
  password: string;
  isActive: boolean;
  isVerified: boolean;
  verifiedAt: Date;
  verifiedByEmail: boolean;
  verifiedByPhone: boolean;
}
