import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from './permissions.service';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../auth/services/token.service';
import { AbilityFactory } from '../auth/ability/ability.factory';
import { AuthService } from '../auth/services/auth.service';

describe('PermissionsService', () => {
  let service: PermissionsService;

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
      providers: [PermissionsService,
        {
          provide: DRIZZLE,
          useValue: mockDrizzle,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: AbilityFactory,
          useValue: mockAbilityFactory,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
