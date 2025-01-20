import { HttpException, HttpStatus, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { roles } from '../drizzle/schema/schema';
import { PageDto, PageMetaDto, PageOptionsDto } from '@/core/dto';
import { DrizzleDB } from '../drizzle/types/drizzle';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { PgColumn } from 'drizzle-orm/pg-core';
import { adminPermission, permissionRole, permissions } from '../drizzle/schema/admin-module.schema';
import { and, asc, desc, eq, like, not, or, sql } from 'drizzle-orm';
import slugify from 'slugify';

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  // get all admins
  async findAll(query: PageOptionsDto) {
    const limit: number = query.limit || 10;
    const page: number = query.page || 1;
    const search = query.search || '';

    let sort: PgColumn = permissions.id;

    if (query.sort) {
      sort = permissions[query.sort];
    }

    const order = query.order || 'asc';
    const isActive = query.isActive || undefined;

    const dbQuery = this.db
      .select()
      .from(permissions)
      .where(and(or(like(permissions.name, `%${search}%`))))
      .$dynamic();

    const total = await this.db.$count(dbQuery);

    // const result = await withPagination(dbQuery, order === 'asc' ? asc(sort) : desc(sort), page, limit);

    const resultQuery = await this.db.query.permissions.findMany({
      orderBy: order === 'desc' ? [desc(sort)] : [asc(sort)],
      where: and(or(like(permissions.name, `%${search}%`))),
      extras: {
        adminCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${adminPermission} ap
          WHERE ap.permission_id = ${permissions.id}
        )`.as('adminCount'),
        roleCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${permissionRole} pr
          WHERE pr.permission_id = ${permissions.id}
        )`.as('roleCount'),
      },
      with: {
        roles: true,
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
    const item = await this.db.query.permissions.findFirst({
      where: eq(permissions.id, Number(id)),
      extras: {
        adminCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${adminPermission} ap
          WHERE ap.permission_id = ${permissions.id}
        )`.as('adminCount'),
        roleCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${permissionRole} pr
          WHERE pr.permission_id = ${permissions.id}
        )`.as('roleCount'),
      },
      with: {
        roles: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Permission not found');
    }

    return item;
  }

  // add permission
  async create(createDto: CreatePermissionDto) {
    const slug = slugify(createDto.name);
    const checkItem = await this.db.query.permissions.findFirst({
      where: or(eq(permissions.name, createDto.name || ''), eq(permissions.slug, slug)),
    });

    if (checkItem) {
      throw new HttpException('Role already exists ', HttpStatus.BAD_REQUEST);
    }

    const insertedRole = await this.db
      .insert(permissions)
      .values({
        name: createDto.name,
        slug: slug,
        group: createDto.group,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return {
      message: 'Permission Created Successfully',
    };
  }

  // get admin by id
  async findById(id: number) {
    const item = await this.db.query.permissions.findFirst({
      where: eq(permissions.id, id),
    });

    if (!item) {
      throw new NotFoundException('Permission not found');
    }

    return item;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    const data = await this.db.query.permissions.findFirst({
      where: eq(permissions.id, id),
    });

    if (!data) {
      throw new HttpException('Permission Not Found ', HttpStatus.BAD_REQUEST);
    }

    // check if exists
    const checkItem = await this.db.query.permissions.findFirst({
      where: and(
        not(eq(permissions.id, id)),
        or(
          eq(permissions.name, updatePermissionDto.name || ''),
          eq(permissions.slug, slugify(updatePermissionDto.name || '')),
        ),
      ),
    });

    if (checkItem) {
      throw new HttpException('Role already exists ', HttpStatus.BAD_REQUEST);
    }

    await this.db
      .update(permissions)
      .set({
        name: updatePermissionDto.name ? updatePermissionDto.name : data.name,
        slug: slugify(updatePermissionDto.name || ''),
        group: updatePermissionDto.group ? updatePermissionDto.group : data.group,
        updatedAt: new Date(),
      })
      .where(eq(permissions.id, id));

    return {
      message: 'Permission Updated Successfully',
    };
  }

  async remove(id: number) {
    const item = await this.db.query.permissions.findFirst({
      where: eq(permissions.id, id),
      extras: {
        adminCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${adminPermission} ap
          WHERE ap.permission_id = ${permissions.id}
        )`.as('adminCount'),
        roleCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${permissionRole} pr
          WHERE pr.permission_id = ${permissions.id}
        )`.as('roleCount'),
      },
    });

    if (!item) {
      throw new HttpException('Permission not found', HttpStatus.BAD_REQUEST);
    }

    if (item.adminCount > 0) {
      throw new HttpException('Permission has admins, cannot be deleted', HttpStatus.BAD_REQUEST);
    }

    if (item.roleCount > 0) {
      throw new HttpException('Permission has roles, cannot be deleted', HttpStatus.BAD_REQUEST);
    }

    await this.db.delete(permissions).where(eq(permissions.id, id));

    return {
      message: 'Permission deleted successfully',
    };
  }

  // getAllPermissions
  async getAllPermissions() {
    const items = await this.db.select().from(permissions).orderBy(asc(permissions.slug));

    return {
      message: 'Items fetched successfully',
      items: items,
    };
  }
}
