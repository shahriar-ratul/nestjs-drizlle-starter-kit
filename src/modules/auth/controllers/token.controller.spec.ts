import { Test, TestingModule } from "@nestjs/testing";
import { TokenController } from "./token.controller";
import { TokenService } from "../services/token.service";
import { DRIZZLE } from "@/modules/drizzle/drizzle.module";
import { JwtService } from "@nestjs/jwt";


describe("TokenController", () => {
  let controller: TokenController;

  const mockTokenService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokenController],
      providers: [
        TokenService,
        {
          provide: DRIZZLE,
          useValue: mockDrizzleDB,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<TokenController>(TokenController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
