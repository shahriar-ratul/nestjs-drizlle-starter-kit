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
import { PageDto, PageMetaDto, PageOptionsDto } from './../../../core/dto';
import { DrizzleDB } from '@/modules/drizzle/types/drizzle.d';
import { DRIZZLE } from '@/modules/drizzle/drizzle.module';
import { adminRole, admins } from '@/modules/drizzle/schema/admin-module.schema';
import { and, desc, eq, inArray, isNull, not, or } from 'drizzle-orm';
import { asc } from 'drizzle-orm';
import { like } from 'drizzle-orm';
import { withPagination } from '@/common/helpers/drizzleHelper';
import { PgColumn } from 'drizzle-orm/pg-core';

@Injectable()
export class AdminsService {
  private readonly logger = new Logger(AdminsService.name);
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  // get all admins
  async findAll(query: PageOptionsDto) {
    const limit: number = query.limit || 10;
    const page: number = query.page || 1;
    const search = query.search || '';

    let sort: PgColumn = admins.id;

    if (query.sort) {
      sort = admins[query.sort];
    }

    const order = query.order || 'asc';
    const isActive = query.isActive || true;

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
          eq(admins.isActive, isActive),
        ),
      )
      .$dynamic();

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
        eq(admins.isActive, isActive),
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

    this.logger.log(JSON.stringify(total), 'total');

    const pageMetaDto = new PageMetaDto({
      total: total,
      pageOptionsDto: {
        page,
        limit,
      },
    });

    return new PageDto(resultQuery, pageMetaDto);
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

    return admin;
  }

  // add admin
  async create(createAdminDto: CreateAdminDto, file: Express.Multer.File) {
    const checkAdmin = await this.db.query.admins.findFirst({
      where: or(
        eq(admins.email, createAdminDto.email || ''),
        eq(admins.username, createAdminDto.username || ''),
        eq(admins.phone, createAdminDto.mobile || ''),
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
        phone: createAdminDto.mobile,
        password: createPassword,
        isActive: createAdminDto.isActive,
        photo: file ? file.path : null,
        joinedDate: createAdminDto.joinedDate || new Date(),
        dob: createAdminDto.dob || null,
        createdBy: createAdminDto.createdBy || null,
        updatedBy: createAdminDto.createdBy || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isVerified: false,
        verifiedAt: null,
        verifiedByEmail: false,
        verifiedByPhone: false,
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
        deleted: false,
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

    return {
      item: adminItem,
      permissions: sortedPermissions,
    };
  }

  async update(id: number, updateAdminDto: UpdateAdminDto, file: Express.Multer.File) {
    const data = await this.db.query.admins.findFirst({
      where: eq(admins.id, id),
    });

    if (!data) {
      throw new HttpException('Admin Not Found ', HttpStatus.BAD_REQUEST);
    }

    // check if email or username or mobile exists
    const checkAdmin = await this.db.query.admins.findFirst({
      where: and(
        not(eq(admins.id, id)),
        or(
          eq(admins.email, updateAdminDto.email || ''),
          eq(admins.username, updateAdminDto.username || ''),
          eq(admins.phone, updateAdminDto.mobile || ''),
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
        phone: updateAdminDto.mobile ? updateAdminDto.mobile : data.phone,
        isActive: updateAdminDto.isActive ? updateAdminDto.isActive : data.isActive,
        photo: file ? file.path : data.photo,
        joinedDate: updateAdminDto.joinedDate ? updateAdminDto.joinedDate : data.joinedDate,
        dob: updateAdminDto.dob ? updateAdminDto.dob : data.dob,
        firstName: updateAdminDto.firstName ? updateAdminDto.firstName : data.firstName,
        lastName: updateAdminDto.lastName ? updateAdminDto.lastName : data.lastName,
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
        deleted: true,
        deletedAt: new Date(),
        deletedBy: id,
      })
      .where(eq(admins.id, id));

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
