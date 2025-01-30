import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '@/modules/auth/services/token.service';

import { Request } from 'express';
import { Admin, adminRole, admins, adminToken, permissions, roles } from '@/modules/drizzle/schema/admin-module.schema';
import { eq, or, sql } from 'drizzle-orm';
import { DrizzleDB } from '@/modules/drizzle/types/drizzle';
import { DRIZZLE } from '@/modules/drizzle/drizzle.module';
import { ForgotPasswordDto } from '../dto/forgot.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

import { Request as TypeRequest } from 'express';

// 1 day in milliseconds
const EXPIRE_TIME = 1000 * 60 * 60 * 24 * 3;
@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    private jwtService: JwtService,
    private tokenService: TokenService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { username, email, password } = registerDto;
    if (!username || !email || !password) {
      throw new UnprocessableEntityException('Username, Email, Password is required');
    }

    const checkUsername = await this.db.query.admins.findFirst({
      where: eq(admins.username, username),
    });
    if (checkUsername) {
      throw new UnprocessableEntityException('Username is already taken');
    }

    const checkEmail = await this.db.query.admins.findFirst({
      where: eq(admins.email, email),
    });

    if (checkEmail) {
      throw new UnprocessableEntityException('Email is already taken');
    }

    const checkMobile = await this.db.query.admins.findFirst({
      where: eq(admins.phone, registerDto.mobile),
    });

    if (checkMobile) {
      throw new UnprocessableEntityException('Mobile is already taken');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminInsertData = await this.db
      .insert(admins)
      .values({
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        dob: registerDto.dob,
        phone: registerDto.mobile,
        username: username,
        email: email,
        password: hashedPassword,
        joinedDate: sql`CURRENT_TIMESTAMP`,
        gender: registerDto.gender,
        isActive: true,
      })
      .returning();

    const admin = adminInsertData[0];

    const userRole = await this.db.query.roles.findFirst({
      where: eq(roles.slug, 'user'),
    });

    if (!userRole) {
      throw new BadRequestException('User role not found');
    }

    await this.db.insert(adminRole).values({
      adminId: admin.id,
      roleId: userRole.id,
    });

    return {
      message: 'Register successfully',
    };
  }

  async findAdmin(id: number) {
    const admin = await this.db.query.admins.findFirst({
      where: eq(admins.id, id),
      columns: {
        password: false,
        isDeleted: false,
        deletedReason: false,
        deletedAt: false,
        deletedBy: false,
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  async findAdminByUsernameOrEmailOrPhone(username: string) {
    const admin = await this.db.query.admins.findFirst({
      where: or(eq(admins.username, username), eq(admins.email, username), eq(admins.phone, username)),
    });

    if (!admin) {
      throw new UnprocessableEntityException('Admin not found');
    }

    return admin;
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

    const rolePermissions = item.roles.map((role) => {
      return role.role?.permissions.map((permission) => permission.permission?.slug);
    });

    const adminPermissions = item.permissions?.map((permission) => permission.permission?.slug);

    let permissions: string[] = [];

    // Flatten and filter out undefined values from role permissions
    const flattenedRolePermissions = rolePermissions.flat().filter((p): p is string => p !== undefined);

    // Filter out undefined values from admin permissions
    const filteredAdminPermissions = adminPermissions?.filter((p): p is string => p !== undefined) ?? [];

    permissions = [...flattenedRolePermissions, ...filteredAdminPermissions];

    return permissions;
  }

  async login(
    credential: LoginDto,
    request: Request,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const user = await this.findAdminByUsernameOrEmailOrPhone(credential.username);

    if (!user) {
      throw new UnprocessableEntityException('invalid credentials');
    }

    if (!(await bcrypt.compare(credential.password, user.password))) {
      throw new UnprocessableEntityException('Password is incorrect');
    }

    if (user.isActive === false) {
      throw new UnprocessableEntityException('Your Have Been Blocked. Please Contact Admin');
    }

    const payload = {
      username: user.username,
      email: user.email,
      sub: user.id,
    };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '3d',
      secret: process.env.JWT_SECRET,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_TOKEN_KEY,
    });

    // 3d = 3 days
    const expiresIn = EXPIRE_TIME;

    let ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress;

    // convert ip to string
    ip = ip?.toString();

    try {
      const data = await this.db.insert(adminToken).values({
        token: token,
        refreshToken: refreshToken,
        adminId: user.id,
        ip: ip || '',
        userAgent: request.headers['user-agent'] || '',
        expiresAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
      });
    } catch (error) {
      console.log(error);
      throw new UnprocessableEntityException('Failed to create token');
    }

    try {
      await this.db
        .update(admins)
        .set({
          lastLogin: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(admins.id, user.id));
    } catch (error) {
      console.log(error);
      throw new UnprocessableEntityException('Failed to update last login');
    }

    return {
      accessToken: token,
      refreshToken: refreshToken,
      expiresIn: expiresIn,
    };
  }

  async validateUser(credential: LoginDto) {
    const user = await this.findAdminByUsernameOrEmailOrPhone(credential.username);

    if (!user) {
      throw new BadRequestException('invalid credentials');
    }

    if (!(await bcrypt.compare(credential.password, user.password))) {
      throw new BadRequestException('Password is incorrect');
    }

    if (user.isActive === false) {
      throw new BadRequestException('Your Have Been Blocked. Please Contact Admin');
    }

    return user;
  }

  async getProfile(req: TypeRequest) {
    try {
      const id = (req.user as any).id as number;
      const user = await this.findAdmin(id);

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const permissions = await this.getPermissions(id);

      return {
        item: user,
        permissions: permissions,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Invalid Token');
    }
  }

  async verifyToken(req: TypeRequest): Promise<{ message: string }> {
    const id = (req.user as any).id as number;
    const user = await this.findAdmin(id);

    if (!user) {
      throw new UnprocessableEntityException('invalid credentials');
    }

    if (user.isActive === false) {
      throw new BadRequestException('Your Have Been Blocked. Please Contact Admin');
    }

    return {
      message: 'success',
    };
  }

  async logout(req: TypeRequest): Promise<{ message: string }> {
    if (!req.headers.authorization) {
      throw new UnauthorizedException('Authorization header is missing');
    }
    const token = req.headers.authorization.split(' ')[1];

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

    if (!token) {
      throw new UnprocessableEntityException('Token is missing');
    }

    await this.tokenService.revokeToken(token, ip as string);
    return { message: 'Logout successful' };
  }
}
