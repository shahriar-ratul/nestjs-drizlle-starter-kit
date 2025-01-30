import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'bcrypt';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';
import { PageDto, PageMetaDto } from '@/core/dto';
import { DrizzleDB } from '@/modules/drizzle/types/drizzle.d';
import { DRIZZLE } from '@/modules/drizzle/drizzle.module';
import {
  adminPermission,
  adminRole,
  admins,
  adminToken,
  AdminWithRoles,
  permissionRole,
  permissions,
  roles,
} from '@/modules/drizzle/schema/admin-module.schema';
import { and, desc, eq, inArray, isNull, not, or, exists, sql } from 'drizzle-orm';
import { asc } from 'drizzle-orm';
import { like } from 'drizzle-orm';
import { withPagination } from '@/common/helpers/drizzleHelper';
import { alias, PgColumn } from 'drizzle-orm/pg-core';
import { AdminPageOptionsDto } from '@/core/dto/admin-page-option.dto';
import { getImageUrl } from '@/common/helpers/GenerateHelpers';

@Injectable()
export class AdminsService {
  private readonly logger = new Logger(AdminsService.name);
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  // get all admins
  async findAll(query: AdminPageOptionsDto) {
    const limit: number = query.limit || 10;
    const page: number = query.page || 1;
    const search = query.search || '';

    let sort: PgColumn = admins.id;

    if (query.sort) {
      sort = admins[query.sort];
    }

    const order = query.order || 'asc';
    let isDeleted: boolean = false;
    let isActive: boolean | undefined;
    let filterRoles: number[] | undefined;

    if (query.roles) {
      filterRoles = JSON.parse(query.roles);
      filterRoles = filterRoles?.map((role) => Number(role));
    }

    switch (query.isActive) {
      case 'true':
        isActive = true;
        break;
      case 'false':
        isActive = false;
        break;
      default:
        isActive = undefined;
        break;
    }

    switch (query.isDeleted) {
      case 'true':
        isDeleted = true;
        break;
      case 'false':
        isDeleted = false;
        break;
      default:
        isDeleted = false;
        break;
    }

    const dbQuery = this.db
      .select()
      .from(admins)
      .where(
        and(
          or(
            like(admins.firstName, `%${search}%`),
            like(admins.lastName, `%${search}%`),
            like(admins.username, `%${search}%`),
            like(admins.email, `%${search}%`),
            like(admins.phone, `%${search}%`),
          ),
          isActive !== undefined ? eq(admins.isActive, isActive) : undefined,
          isDeleted !== undefined ? eq(admins.isDeleted, isDeleted) : undefined,
        ),
      )
      .$dynamic();

    if (filterRoles) {
      dbQuery.leftJoin(adminRole, eq(admins.id, adminRole.adminId)).where(inArray(adminRole.roleId, filterRoles));
    }

    const total = await this.db.$count(dbQuery);

    // const result = await withPagination(dbQuery, order === 'asc' ? asc(sort) : desc(sort), page, limit);

    const resultQuery = await this.db.query.admins.findMany({
      columns: {
        password: false,
        deleted: false,
        deletedAt: false,
        deletedBy: false,
      },
      orderBy: order === 'desc' ? [desc(sort)] : [asc(sort)],
      where: and(
        or(
          like(admins.firstName, `%${search}%`),
          like(admins.lastName, `%${search}%`),
          like(admins.username, `%${search}%`),
          like(admins.email, `%${search}%`),
          like(admins.phone, `%${search}%`),
        ),
        isDeleted !== undefined ? eq(admins.isDeleted, isDeleted) : undefined,
        isActive !== undefined ? eq(admins.isActive, isActive) : undefined,
        filterRoles && filterRoles.length > 0
          ? exists(
              this.db
                .select()
                .from(adminRole)
                .where(and(eq(adminRole.adminId, admins.id), inArray(adminRole.roleId, filterRoles))),
            )
          : undefined,
      ),
      with: {
        createdByAdmin: true,
        updatedByAdmin: true,
        deletedByAdmin: true,
        roles: {
          with: {
            role: {
              with: {
                permissions: {
                  with: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        permissions: true,
        tokens: true,
      },
      limit: limit,
      offset: (page - 1) * limit,
    });

    // this.logger.log(JSON.stringify(result));
    // this.logger.log(JSON.stringify(resultQuery));

    const pageMetaDto = new PageMetaDto({
      total: total,
      pageOptionsDto: {
        page,
        limit,
      },
    });

    const result = resultQuery.map((item) => {
      return {
        ...item,
        photo: item.photo ? getImageUrl(item.photo) : null,
        createdAt: item.createdAt ? item.createdAt.toISOString() : null,
        updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null,
        lastLogin: item.lastLogin ? item.lastLogin.toISOString() : null,
        verifiedAt: item.verifiedAt ? item.verifiedAt.toISOString() : null,
      };
    });

    return new PageDto(result, pageMetaDto);
  }

  async findOne(id: string) {
    const admin = await this.db.query.admins.findFirst({
      columns: {
        password: false,
        deleted: false,
        deletedAt: false,
        deletedBy: false,
      },
      where: eq(admins.id, Number(id)),
      with: {
        createdByAdmin: {
          where: isNull(admins.createdBy),
        },
        updatedByAdmin: {
          where: isNull(admins.updatedBy),
        },
        deletedByAdmin: {
          where: isNull(admins.deletedBy),
        },
        roles: {
          with: {
            role: {
              with: {
                permissions: true,
              },
            },
          },
        },
        permissions: true,
        tokens: true,
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    admin.photo = admin.photo ? getImageUrl(admin.photo) : null;
    admin.createdAt = admin.createdAt ? admin.createdAt.toISOString() : null;
    admin.updatedAt = admin.updatedAt ? admin.updatedAt.toISOString() : null;
    admin.lastLogin = admin.lastLogin ? admin.lastLogin.toISOString() : null;
    admin.verifiedAt = admin.verifiedAt ? admin.verifiedAt.toISOString() : null;

    return {
      item: admin,
      message: 'Admin fetched successfully',
    };
  }

  // add admin
  async create(createAdminDto: CreateAdminDto, file: Express.Multer.File) {
    const checkAdmin = await this.db.query.admins.findFirst({
      where: or(
        eq(admins.email, createAdminDto.email || ''),
        eq(admins.username, createAdminDto.username || ''),
        eq(admins.phone, createAdminDto.phone || ''),
      ),
    });

    if (checkAdmin) {
      throw new HttpException('Admin already exists ', HttpStatus.BAD_REQUEST);
    }

    const createPassword = await hash(createAdminDto.password, 15);

    const insertedAdmin = await this.db
      .insert(admins)
      .values({
        firstName: createAdminDto.firstName,
        lastName: createAdminDto.lastName,
        email: createAdminDto.email,
        username: createAdminDto.username,
        phone: createAdminDto.phone,
        gender: createAdminDto.gender,
        password: createPassword,
        isActive: createAdminDto.isActive === 'true' ? true : false,
        photo: file ? file.path : undefined,
        joinedDate: createAdminDto.joinedDate ? new Date(createAdminDto.joinedDate) : undefined,
        dob: createAdminDto.dob ? new Date(createAdminDto.dob) : undefined,
        createdBy: Number(createAdminDto.createdBy) || undefined,
        updatedBy: Number(createAdminDto.updatedBy) || undefined,
        createdAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
        isVerified: false,
        verifiedAt: undefined,
        verifiedByEmail: false,
        verifiedByPhone: false,
        isDeleted: false,
      })
      .returning();

    const admin = insertedAdmin[0];

    for (const role of createAdminDto.roles) {
      await this.db.insert(adminRole).values({
        adminId: admin.id,
        roleId: Number(role),
      });
    }

    return {
      message: 'Admin Created Successfully',
    };
  }

  // get admin by id
  async findById(id: number) {
    const item = await this.db.query.admins.findFirst({
      where: eq(admins.id, id),
      with: {
        roles: {
          with: {
            role: {
              with: {
                permissions: {
                  with: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        permissions: {
          with: {
            permission: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Admin not found');
    }

    const rolePermissions = item.roles.map((role) =>
      role.role?.permissions.map((permission) => permission.permission?.slug),
    );

    const adminPermissions = item.permissions?.map((permission) => permission.permission?.slug);

    let permissions: string[] = [];

    // Flatten and filter out undefined values from role permissions
    const flattenedRolePermissions = rolePermissions.flat().filter((p): p is string => p !== undefined);

    // Filter out undefined values from admin permissions
    const filteredAdminPermissions = adminPermissions?.filter((p): p is string => p !== undefined) ?? [];

    permissions = [...flattenedRolePermissions, ...filteredAdminPermissions];

    // filter out duplicate permissions
    permissions = permissions.filter((v, i, a) => a.findIndex((t) => t === v) === i);

    // sort permissions
    const sortedPermissions = permissions.sort();

    const adminItem = await this.db.query.admins.findFirst({
      where: eq(admins.id, id),
      columns: {
        password: false,
        isDeleted: false,
        deletedAt: false,
        deletedBy: false,
      },
      with: {
        roles: {
          with: {
            role: true,
          },
        },
      },
    });

    if (!adminItem) {
      throw new NotFoundException('Admin not found');
    }

    adminItem.photo = adminItem.photo ? getImageUrl(adminItem.photo) : null;
    adminItem.createdAt = adminItem.createdAt ? adminItem.createdAt.toISOString() : null;
    adminItem.updatedAt = adminItem.updatedAt ? adminItem.updatedAt.toISOString() : null;
    adminItem.lastLogin = adminItem.lastLogin ? adminItem.lastLogin.toISOString() : null;
    adminItem.verifiedAt = adminItem.verifiedAt ? adminItem.verifiedAt.toISOString() : null;

    return {
      item: adminItem,
      permissions: sortedPermissions,
      message: 'Admin fetched successfully',
    };
  }

  async update(id: number, updateAdminDto: UpdateAdminDto, file: Express.Multer.File) {
    const data = await this.db.query.admins.findFirst({
      where: eq(admins.id, id),
    });

    if (!data) {
      throw new HttpException('Admin Not Found ', HttpStatus.BAD_REQUEST);
    }

    // check if email or username or phone exists
    const checkAdmin = await this.db.query.admins.findFirst({
      where: and(
        not(eq(admins.id, id)),
        or(
          eq(admins.email, updateAdminDto.email || ''),
          eq(admins.username, updateAdminDto.username || ''),
          eq(admins.phone, updateAdminDto.phone || ''),
        ),
      ),
    });

    if (checkAdmin) {
      throw new HttpException('Admin already exists ', HttpStatus.BAD_REQUEST);
    }

    await this.db
      .update(admins)
      .set({
        email: updateAdminDto.email ? updateAdminDto.email : data.email,
        username: updateAdminDto.username ? updateAdminDto.username : data.username,
        phone: updateAdminDto.phone ? updateAdminDto.phone : data.phone,
        isActive: updateAdminDto.isActive ? updateAdminDto.isActive : data.isActive,
        photo: file ? file.path : data.photo,
        joinedDate: updateAdminDto.joinedDate ? new Date(updateAdminDto.joinedDate) : data.joinedDate,
        dob: updateAdminDto.dob ? new Date(updateAdminDto.dob) : data.dob,
        firstName: updateAdminDto.firstName ? updateAdminDto.firstName : data.firstName,
        lastName: updateAdminDto.lastName ? updateAdminDto.lastName : data.lastName,
        updatedBy: updateAdminDto.updatedBy ? Number(updateAdminDto.updatedBy) : data.updatedBy,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(admins.id, id));

    if (updateAdminDto.password) {
      const updatePassword = await hash(updateAdminDto.password, 15);

      await this.db
        .update(admins)
        .set({
          password: updatePassword,
        })
        .where(eq(admins.id, id));
    }

    if (updateAdminDto.roles && updateAdminDto.roles.length > 0) {
      await this.db.delete(adminRole).where(eq(adminRole.adminId, id));

      for (const role of updateAdminDto.roles) {
        await this.db.insert(adminRole).values({
          adminId: id,
          roleId: Number(role),
        });
      }
    }

    return {
      message: 'Admin Updated Successfully',
    };
  }

  async remove(id: number) {
    const admin = await this.db.query.admins.findFirst({
      where: eq(admins.id, id),
      with: {
        roles: {
          with: {
            role: true,
          },
        },
      },
    });

    if (!admin) {
      throw new HttpException('Admin not found', HttpStatus.BAD_REQUEST);
    }

    if (admin.roles.length > 0) {
      // superadmin role cannot be deleted
      if (admin.roles.find((role) => role.role.slug === 'superadmin')) {
        throw new HttpException('SuperAdmin role cannot be deleted', HttpStatus.BAD_REQUEST);
      }
    }

    // soft delete admin
    await this.db
      .update(admins)
      .set({
        isDeleted: true,
        deletedAt: sql`CURRENT_TIMESTAMP`,
        deletedBy: id,
      })
      .where(eq(admins.id, id));

    return {
      message: 'Admin deleted successfully',
    };
  }

  async delete(id: number) {
    const item: AdminWithRoles = await this.db.query.admins.findFirst({
      where: eq(admins.id, id),
      with: {
        roles: {
          with: {
            role: true,
          },
        },
      },
    });

    if (!item) {
      throw new HttpException('Admin not found', HttpStatus.BAD_REQUEST);
    }

    if (item.roles.length > 0) {
      // superadmin role cannot be deleted
      const superAdminRole = item.roles.find((role) => role.role.slug === 'superadmin');
      if (superAdminRole) {
        throw new HttpException('SuperAdmin role cannot be deleted', HttpStatus.BAD_REQUEST);
      }
    }

    // delete admin
    await this.db.delete(adminRole).where(eq(adminRole.adminId, id));
    await this.db.delete(admins).where(eq(admins.id, id));

    return {
      message: 'Admin deleted successfully',
    };
  }

  async changeStatus(id: number) {
    const admin = await this.db.query.admins.findFirst({
      where: eq(admins.id, id),
    });

    if (!admin) {
      throw new HttpException('Admin not found', HttpStatus.BAD_REQUEST);
    }

    if (admin.username === 'super_admin') {
      throw new HttpException('SuperAdmin status cannot be changed', HttpStatus.BAD_REQUEST);
    }

    await this.db
      .update(admins)
      .set({
        isActive: !admin.isActive,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(admins.id, id));

    return {
      message: 'Status Changed successfully',
    };
  }

  async findByUsername(username: string) {
    return await this.db.query.admins.findFirst({ where: eq(admins.username, username) });
  }

  async findByEmail(email: string) {
    return await this.db.query.admins.findFirst({ where: eq(admins.email, email) });
  }

  async findByUsernameOrEmail(username: string) {
    // check if username or email exists
    return await this.db.query.admins.findFirst({
      where: or(eq(admins.email, username), eq(admins.username, username), eq(admins.phone, username)),
      with: {
        roles: {
          with: {
            role: true,
          },
        },
      },
    });
  }

  async getPermissions(id: number): Promise<string[]> {
    const item = await this.db.query.admins.findFirst({
      where: eq(admins.id, id),
      with: {
        roles: {
          with: {
            role: {
              with: {
                permissions: {
                  with: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        permissions: {
          with: {
            permission: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Admin not found');
    }

    const rolePermissions = item.roles.map((role) =>
      role.role?.permissions.map((permission) => permission.permission?.slug),
    );

    const adminPermissions = item.permissions?.map((permission) => permission.permission?.slug);

    let permissions: string[] = [];

    // Flatten and filter out undefined values from role permissions
    const flattenedRolePermissions = rolePermissions.flat().filter((p): p is string => p !== undefined);

    // Filter out undefined values from admin permissions
    const filteredAdminPermissions = adminPermissions?.filter((p): p is string => p !== undefined) ?? [];

    permissions = [...flattenedRolePermissions, ...filteredAdminPermissions];

    return permissions;
  }

  // getAllAdmins
  async getAllAdmins() {
    const items = await this.db.query.admins.findMany({
      columns: {
        password: false,
        deleted: false,
        deletedAt: false,
        deletedBy: false,
      },
      where: eq(admins.isActive, true),
      with: {
        roles: {
          with: {
            role: true,
          },
        },
      },
    });

    return {
      message: 'Items fetched successfully',
      items: items,
    };
  }
}
