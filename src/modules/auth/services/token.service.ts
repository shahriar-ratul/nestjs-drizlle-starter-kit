import { BadRequestException, Global, Inject, Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';

import { CreateTokenDto } from '../dto/create-token.dto';
import { PageDto, PageMetaDto, PageOptionsDto } from '@/core/dto';
import { format } from 'date-fns';

import { adminToken } from '@/modules/drizzle/schema/admin-module.schema';
import { DrizzleDB } from '@/modules/drizzle/types/drizzle';
import { DRIZZLE } from '@/modules/drizzle/drizzle.module';
import { eq, like, or, and, asc, desc } from 'drizzle-orm';
import { PgColumn } from 'drizzle-orm/pg-core';
import { UpdateTokenDto } from '../dto/update-token.dto';

@Global()
@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  // get all tokens
  async findAll(query: PageOptionsDto) {
    const limit: number = query.limit || 10;
    const page: number = query.page || 1;
    const search = query.search || '';
    let sort: PgColumn = adminToken.id;

    if (query.sort) {
      sort = adminToken[query.sort];
    }

    const order = query.order || 'asc';

    const dbQuery = this.db
      .select()
      .from(adminToken)
      .where(
        and(
          or(
            like(adminToken.token, `%${search}%`),
            like(adminToken.refreshToken, `%${search}%`),
            like(adminToken.ip, `%${search}%`),
            like(adminToken.userAgent, `%${search}%`),
            like(adminToken.expiresAt, `%${search}%`),
          ),
        ),
      )
      .$dynamic();

    const total = await this.db.$count(dbQuery);

    // const result = await withPagination(dbQuery, order === 'asc' ? asc(sort) : desc(sort), page, limit);

    const resultQuery = await this.db.query.adminToken.findMany({
      orderBy: order === 'desc' ? [desc(sort)] : [asc(sort)],
      where: and(
        or(
          like(adminToken.token, `%${search}%`),
          like(adminToken.refreshToken, `%${search}%`),
          like(adminToken.ip, `%${search}%`),
          like(adminToken.userAgent, `%${search}%`),
          like(adminToken.expiresAt, `%${search}%`),
        ),
      ),
      with: {
        admin: true,
        revokedByAdmin: true,
      },
      limit: limit,
      offset: (page - 1) * limit,
    });

    const pageMetaDto = new PageMetaDto({
      total: total,
      pageOptionsDto: {
        page,
        limit,
      },
    });

    return new PageDto(resultQuery, pageMetaDto);
  }

  async create(createTokenDto: CreateTokenDto) {
    await this.db.insert(adminToken).values({
      token: createTokenDto.token || '',
      refreshToken: createTokenDto.refresh_token || '',
      ip: createTokenDto.ip || '',
      userAgent: createTokenDto.userAgent || '',
      expiresAt: createTokenDto.expires_at,
      adminId: Number(createTokenDto.admin_id),
    });

    const timeNow = format(new Date(), 'yyyy-MM-dd HH:mm:ss a');

    return {
      message: `Token Created Successfully by Admin ID: ${createTokenDto.admin_id} ip: ${createTokenDto.ip} at time: ${timeNow}`,
    };
  }

  // findById
  async findById(id: number) {
    const token = await this.db.query.adminToken.findFirst({
      where: eq(adminToken.id, id),
      with: {
        admin: true,
        revokedByAdmin: true,
      },
    });

    if (!token) {
      throw new BadRequestException('Token not found');
    }

    return token;
  }

  async findByAdminId(adminId: number) {
    const tokens = await this.db.query.adminToken.findMany({
      where: eq(adminToken.adminId, adminId),
      with: {
        admin: true,
      },
    });

    if (!tokens) {
      throw new BadRequestException('Tokens not found');
    }

    return tokens;
  }

  async findByToken(token: string) {
    const tokenData = await this.db.query.adminToken.findFirst({
      where: eq(adminToken.token, token),
      with: {
        admin: true,
        revokedByAdmin: true,
      },
    });

    if (!tokenData) {
      throw new BadRequestException('Token not found');
    }

    return tokenData;
  }

  // isRevokedToken
  async isRevokedToken(token: string) {
    const tokenData = await this.db.query.adminToken.findFirst({
      where: eq(adminToken.token, token),
    });

    if (!tokenData) {
      return false;
    }

    if (tokenData.isRevoked) {
      return true;
    }

    return false;
  }

  // update
  async update(id: number, updateTokenDto: UpdateTokenDto) {
    const tokenData = await this.db.query.adminToken.findFirst({
      where: eq(adminToken.id, id),
    });

    if (!tokenData) {
      throw new BadRequestException('Token not found');
    }

    return await this.db
      .update(adminToken)
      .set({
        token: updateTokenDto.token || '',
        refreshToken: updateTokenDto.refresh_token || '',
        ip: updateTokenDto.ip || '',
        userAgent: updateTokenDto.userAgent || '',
        expiresAt: updateTokenDto.expires_at,
        adminId: Number(updateTokenDto.admin_id),
      })
      .where(eq(adminToken.id, id));
  }

  async remove(id: number) {
    const item = await this.db.query.adminToken.findFirst({
      where: eq(adminToken.id, id),
    });

    if (!item) {
      throw new UnprocessableEntityException('Token Not Found');
    }

    return await this.db.delete(adminToken).where(eq(adminToken.id, id));
  }

  async revokeToken(token: string, ip: string) {
    const tokenData = await this.db.query.adminToken.findFirst({
      where: eq(adminToken.token, token),
    });

    if (!tokenData) {
      throw new UnprocessableEntityException('Token Not Found');
    }

    const result = await this.db
      .update(adminToken)
      .set({
        isRevoked: true,
        revokedBy: tokenData.revokedBy || null,
        revokedAt: new Date(),
        revokedByIp: ip,
      })
      .where(eq(adminToken.id, tokenData.id))
      .returning();

    if (!result) {
      throw new UnprocessableEntityException('Failed to revoke token');
    }

    return {
      message: 'Token revoked successfully',
    };
  }
}
