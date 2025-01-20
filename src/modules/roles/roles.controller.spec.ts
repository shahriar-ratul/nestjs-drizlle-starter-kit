import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { JwtService } from '@nestjs/jwt';
import { AbilityFactory } from '../auth/ability/ability.factory';
import { AuthService } from '../auth/services/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TokenService } from '../auth/services/token.service';

describe('RolesController', () => {
  let controller: RolesController;

  const mockDrizzle = {
    query: jest.fn(),
    delete: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    select: jest.fn(),
    transaction: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockAbilityFactory = {
    defineAbility: jest.fn(),
  };

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(),
  };

  const mockTokenService = {
    sign: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        RolesService,
        {
          provide: DRIZZLE,
          useValue: mockDrizzle,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: AbilityFactory,
          useValue: mockAbilityFactory,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtAuthGuard,
          useValue: mockJwtAuthGuard,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
  });

  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
