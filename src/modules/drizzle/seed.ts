import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/schema';
import 'dotenv/config';
import { faker } from '@faker-js/faker';
import { permissionSeeds } from './seedData/permission';
import { adminSeeds } from './seedData/admin';
import { roleSeeds } from './seedData/role';
import { eq, inArray, not } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { reset, seed } from 'drizzle-seed';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});
const db = drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;

const makeAdminUniquePhone = async () => {
  const phone = faker.phone.number();
  const admin = await db.query.admins.findFirst({
    where: eq(schema.admins.phone, phone),
  });

  if (admin) {
    return makeAdminUniquePhone();
  }

  return phone;
};

const makeAdminUniqueUsername = async () => {
  const username = faker.internet.username();
  const admin = await db.query.admins.findFirst({
    where: eq(schema.admins.username, username),
  });

  if (admin) {
    return makeAdminUniqueUsername();
  }

  return username;
};

const makeAdminUniqueEmail = async () => {
  const email = faker.internet.email();
  const admin = await db.query.admins.findFirst({
    where: eq(schema.admins.email, email),
  });

  if (admin) {
    return makeAdminUniqueEmail();
  }

  return email;
};

const makeUserUniquePhone = async () => {
  const phone = faker.phone.number();
  const user = await db.query.users.findFirst({
    where: eq(schema.users.phone, phone),
  });

  if (user) {
    return makeUserUniquePhone();
  }

  return phone;
};

const makeUserUniqueUsername = async () => {
  const username = faker.internet.username();
  const user = await db.query.users.findFirst({
    where: eq(schema.users.username, username),
  });

  if (user) {
    return makeUserUniqueUsername();
  }

  return username;
};

const makeUserUniqueEmail = async () => {
  const email = faker.internet.email();
  const user = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });

  if (user) {
    return makeUserUniqueEmail();
  }

  return email;
};

async function main() {
  await reset(db, schema);
  // truncate tables in correct order (delete child tables before parent tables)
  await db.delete(schema.adminRole).execute();
  await db.delete(schema.adminPermission).execute();
  await db.delete(schema.permissionRole).execute();
  await db.delete(schema.admins).execute();
  await db.delete(schema.users).execute();
  await db.delete(schema.permissions).execute();
  await db.delete(schema.roles).execute();

  console.log('Truncated tables');

  console.log('Seeding users');

  // users
  const userIds = await Promise.all(
    Array(1000)
      .fill('')
      .map(async () => {
        const user = await db
          .insert(schema.users)
          .values({
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            dob: faker.date.birthdate(),
            gender: faker.person.gender(),
            phone: await makeUserUniquePhone(),
            username: await makeUserUniqueUsername(),
            email: await makeUserUniqueEmail(),
            password: await bcrypt.hash('password', 15),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        console.log(user);
        return user[0].id;
      }),
  );
  console.log(userIds);
  console.log('Seeding users done');

  // permissions
  for (const permission of permissionSeeds) {
    await db.insert(schema.permissions).values({
      name: permission.name,
      slug: permission.slug,
      group: permission.group,
    });
  }
  console.log('Seeding permissions done');

  // roles
  for (const role of roleSeeds) {
    const roleInsertData = await db
      .insert(schema.roles)
      .values({
        name: role.name,
        slug: role.slug,
        description: role.description,
        isDefault: role.isDefault,
      })
      .returning();

    console.log('roleInsertData', roleInsertData);
    const roleId = roleInsertData[0].id;

    if (role.slug == 'superadmin' || role.slug == 'admin') {
      // insert permissions
      const permissions = await db.select().from(schema.permissions);
      for (const permission of permissions) {
        await db.insert(schema.permissionRole).values({
          roleId: roleId as number,
          permissionId: permission.id as number,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    if (role.slug != 'superadmin' && role.slug != 'admin') {
      // insert permissions
      const permissions = await db.query.permissions.findMany({
        where: not(
          inArray(schema.permissions.slug, [
            'admin.view',
            'admin.create',
            'admin.update',
            'admin.delete',
            'admin.status',
            'role.view',
            'role.create',
            'role.update',
            'role.delete',
            'role.status',
            'permission.view',
            'permission.create',
            'permission.update',
            'permission.delete',
          ]),
        ),
      });

      for (const permission of permissions) {
        await db.insert(schema.permissionRole).values({
          roleId: roleId as number,
          permissionId: permission.id as number,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  }

  console.log('Seeding roles done');

  console.log('Seeding admins');

  // admins
  for (const admin of adminSeeds) {
    const adminInsertData = await db
      .insert(schema.admins)
      .values({
        firstName: admin.firstName,
        lastName: admin.lastName,
        dob: new Date(admin.dob),
        phone: admin.phone,
        username: admin.username,
        email: admin.email,
        password: await bcrypt.hash('password', 15),
        gender: admin.gender,
        createdAt: new Date(),
        updatedAt: new Date(),
        isVerified: admin.isVerified,
        createdBy: null,
        updatedBy: null,
        isActive: admin.isActive,
        verifiedAt: admin.verifiedAt,
        verifiedByEmail: admin.verifiedByEmail,
        verifiedByPhone: admin.verifiedByPhone,
      })
      .returning();

    const adminData = adminInsertData[0];

    if (adminData.username == 'super_admin') {
      const superAdminRole = await db.query.roles.findFirst({
        where: eq(schema.roles.slug, 'superadmin'),
      });

      if (superAdminRole) {
        await db.insert(schema.adminRole).values({
          adminId: adminData.id as number,
          roleId: superAdminRole.id as number,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    if (adminData.username == 'admin') {
      const adminRole = await db.query.roles.findFirst({
        where: eq(schema.roles.slug, 'admin'),
      });

      if (adminRole) {
        await db.insert(schema.adminRole).values({
          adminId: adminData.id as number,
          roleId: adminRole.id as number,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    if (adminData.username == 'editor') {
      const editorRole = await db.query.roles.findFirst({
        where: eq(schema.roles.slug, 'editor'),
      });

      if (editorRole) {
        await db.insert(schema.adminRole).values({
          adminId: adminData.id as number,
          roleId: editorRole.id as number,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    if (adminData.username == 'user') {
      const userRole = await db.query.roles.findFirst({
        where: eq(schema.roles.slug, 'user'),
      });

      if (userRole) {
        await db.insert(schema.adminRole).values({
          adminId: adminData.id as number,
          roleId: userRole.id as number,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    console.log('adminData', adminData);
  }

  console.log('Seeding admins done');

  const adminIds = await Promise.all(
    Array(1000)
      .fill('')
      .map(async () => {
        const admin = await db
          .insert(schema.admins)
          .values({
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            dob: new Date(faker.date.birthdate()),
            gender: faker.person.gender(),
            phone: await makeAdminUniquePhone(),
            username: await makeAdminUniqueUsername(),
            email: await makeAdminUniqueEmail(),
            password: await bcrypt.hash('password', 15),
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: null,
            updatedBy: null,
            isActive: true,
            isVerified: true,
            verifiedAt: new Date(),
            verifiedByEmail: true,
            verifiedByPhone: true,
          })
          .returning();

        console.log('admin', admin);

        const adminData = admin[0];

        const userRole = await db.query.roles.findFirst({
          where: eq(schema.roles.slug, 'user'),
        });

        if (userRole) {
          await db.insert(schema.adminRole).values({
            adminId: adminData.id as number,
            roleId: userRole.id as number,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        return admin[0].id;
      }),
  );
  console.log(adminIds);
}

main()
  .then()
  .catch((err) => {
    console.error(err);
    process.exit(0);
  });
