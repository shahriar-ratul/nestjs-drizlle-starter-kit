import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { Order } from '@/core/constants/order.constant';
import { PageOptionsDto } from '@/core/dto/page-options.dto';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { JwtService } from '@nestjs/jwt';

describe('RolesService', () => {
  let service: RolesService;

   const mockDrizzleDB = {
    select: jest.fn().mockResolvedValue([]),
    insert: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockResolvedValue([]),
    delete: jest.fn().mockResolvedValue([]),
    query: {

      admins: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
      }
    },
    $count: jest.fn().mockResolvedValue(0),
  };
  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const pageOptionsDtoMock: PageOptionsDto = {
    limit: 10,
    page: 1,
    search: "",
    sort: "id",
    order: Order.ASC,
    isActive: undefined,
    isDeleted: undefined,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: DRIZZLE,
          useValue: mockDrizzleDB,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
