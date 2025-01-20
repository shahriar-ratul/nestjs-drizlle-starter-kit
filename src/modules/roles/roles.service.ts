import { HttpException, HttpStatus, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { DrizzleDB } from '../drizzle/types/drizzle';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { PageDto, PageMetaDto, PageOptionsDto } from '@/core/dto';
import { adminRole, admins, permissionRole, roles, RoleWithPermissions } from '../drizzle/schema/admin-module.schema';
import { PgColumn } from 'drizzle-orm/pg-core';
import { and, asc, count, desc, eq, like, not, or, sql } from 'drizzle-orm';
import slugify from 'slugify';
import { withPagination } from '@/common/helpers/drizzleHelper';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  // get all admins
  async findAll(query: PageOptionsDto) {
    const limit: number = query.limit || 10;
    const page: number = query.page || 1;
    const search = query.search || '';

    let sort: PgColumn = roles.id;

    if (query.sort) {
      sort = roles[query.sort];
    }

    const order = query.order || 'asc';
    const isActive = query.isActive || undefined;

    const dbQuery = this.db
      .select()
      .from(roles)
      .where(
        and(or(like(roles.name, `%${search}%`)), isActive !== undefined ? eq(roles.isActive, isActive) : undefined),
      )
      .$dynamic();

    const total = await this.db.$count(dbQuery);

    // const result = await withPagination(dbQuery, order === 'asc' ? asc(sort) : desc(sort), page, limit);

    const resultQuery = await this.db.query.roles.findMany({
      orderBy: order === 'desc' ? [desc(sort)] : [asc(sort)],
      where: and(
        or(like(roles.name, `%${search}%`)),
        isActive !== undefined ? eq(roles.isActive, isActive) : undefined,
      ),
      extras: {
        adminCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${adminRole} ar
          WHERE ar.role_id = ${roles.id}
        )`.as('adminCount'),
        permissionCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${permissionRole} pr
          WHERE pr.role_id = ${roles.id}
        )`.as('permissionCount'),
      },
      with: {
        permissions: {
          with: {
            permission: true,
            // role: true,
          },
        },
        // admins: {
        //   with: {
        //     admin: true,
        //   },
        // },
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

    return new PageDto(resultQuery, pageMetaDto);
  }

  async findOne(id: number) {
    const item = await this.db.query.roles.findFirst({
      where: eq(roles.id, Number(id)),
      extras: {
        adminCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${adminRole} ar
          WHERE ar.role_id = ${roles.id}
        )`.as('adminCount'),
        permissionCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${permissionRole} pr
          WHERE pr.role_id = ${roles.id}
        )`.as('permissionCount'),
      },
      with: {
        permissions: true,
        // admins: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Role not found');
    }

    return item;
  }

  // add admin
  async create(createDto: CreateRoleDto) {
    const slug = slugify(createDto.name);
    const checkItem = await this.db.query.roles.findFirst({
      where: or(eq(roles.name, createDto.name || ''), eq(roles.slug, slug)),
    });

    if (checkItem) {
      throw new HttpException('Role already exists ', HttpStatus.BAD_REQUEST);
    }

    const insertedRole = await this.db
      .insert(roles)
      .values({
        name: createDto.name,
        slug: slug,
        description: createDto.description,
        isActive: createDto.isActive,
        isDefault: createDto.isDefault,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const role = insertedRole[0];

    for (const permission of createDto.permissions) {
      await this.db.insert(permissionRole).values({
        roleId: role.id,
        permissionId: Number(permission),
      });
    }

    return {
      message: 'Role Created Successfully',
    };
  }

  // get admin by id
  async findById(id: number) {
    const item = await this.db.query.roles.findFirst({
      where: eq(roles.id, id),
      with: {
        permissions: true,
        admins: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Role not found');
    }

    return item;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const data = await this.db.query.roles.findFirst({
      where: eq(roles.id, id),
    });

    if (!data) {
      throw new HttpException('Role Not Found ', HttpStatus.BAD_REQUEST);
    }

    // check if exists
    const checkItem = await this.db.query.roles.findFirst({
      where: and(
        not(eq(roles.id, id)),
        or(eq(roles.name, updateRoleDto.name || ''), eq(roles.slug, slugify(updateRoleDto.name || ''))),
      ),
    });

    if (checkItem) {
      throw new HttpException('Role already exists ', HttpStatus.BAD_REQUEST);
    }

    await this.db
      .update(roles)
      .set({
        name: updateRoleDto.name ? updateRoleDto.name : data.name,
        slug: slugify(updateRoleDto.name || ''),
        description: updateRoleDto.description ? updateRoleDto.description : data.description,
        isActive: updateRoleDto.isActive ? updateRoleDto.isActive : data.isActive,
        isDefault: updateRoleDto.isDefault ? updateRoleDto.isDefault : data.isDefault,
        updatedAt: new Date(),
      })
      .where(eq(roles.id, id));

    if (updateRoleDto.permissions && updateRoleDto.permissions.length > 0) {
      await this.db.delete(permissionRole).where(eq(permissionRole.roleId, id));

      for (const permission of updateRoleDto.permissions) {
        await this.db.insert(permissionRole).values({
          roleId: id,
          permissionId: Number(permission),
        });
      }
    }

    return {
      message: 'Role Updated Successfully',
    };
  }

  async remove(id: number) {
    const item = await this.db.query.roles.findFirst({
      where: eq(roles.id, id),
      extras: {
        adminCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${adminRole} ar
          WHERE ar.role_id = ${roles.id}
        )`.as('adminCount'),
        permissionCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${permissionRole} pr
          WHERE pr.role_id = ${roles.id}
        )`.as('permissionCount'),
      },
    });

    if (!item) {
      throw new HttpException('Role not found', HttpStatus.BAD_REQUEST);
    }

    if (item.adminCount > 0) {
      throw new HttpException('Role has admins, cannot be deleted', HttpStatus.BAD_REQUEST);
    }

    await this.db.delete(permissionRole).where(eq(permissionRole.roleId, id));
    await this.db.delete(roles).where(eq(roles.id, id));

    return {
      message: 'Role deleted successfully',
    };
  }

  async changeStatus(id: number) {
    const item = await this.db.query.roles.findFirst({
      where: eq(roles.id, id),
    });

    if (!item) {
      throw new HttpException('Role not found', HttpStatus.BAD_REQUEST);
    }

    await this.db
      .update(roles)
      .set({
        isActive: !item.isActive,
        updatedAt: new Date(),
      })
      .where(eq(roles.id, id));

    return {
      message: 'Status Changed successfully',
    };
  }

  async getPermissions(id: number): Promise<string[]> {
    const item = await this.db.query.roles.findFirst({
      where: eq(roles.id, id),
      with: {
        permissions: {
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
      },
    });

    if (!item) {
      throw new NotFoundException('Role not found');
    }

    const rolePermissions = item.permissions.map((role) =>
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
  async getAllRoles() {
    const items = await this.db.query.roles.findMany({
      where: eq(roles.isActive, true),
      with: {
        permissions: {
          with: {
            permission: true,
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
