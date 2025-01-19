import { Test } from "@nestjs/testing";
import { TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { DrizzleDB } from "@/modules/drizzle/types/drizzle";
import { DRIZZLE } from "@/modules/drizzle/drizzle.module";
import { JwtService } from "@nestjs/jwt";
import { TokenService } from "./token.service";

describe("AuthService", () => {
  let service: AuthService;
  let db: DrizzleDB;

  const mockDrizzleDB = {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockTokenService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: DRIZZLE,
          useValue: mockDrizzleDB,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    db = module.get<DrizzleDB>(DRIZZLE);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
