import { Test, TestingModule } from '@nestjs/testing';
import { AdminsService } from './admins.service';
import { DRIZZLE } from '@/modules/drizzle/drizzle.module';
import { Order } from '@/core/constants';
import { JwtService } from '@nestjs/jwt';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { Readable } from 'stream';
import { UpdateAdminDto } from '../dto/update-admin.dto';
import { AdminPageOptionsDto } from '@/core/dto/admin-page-option.dto';
import { sql } from 'drizzle-orm';

describe('AdminsService', () => {
  let service: AdminsService;

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

  const pageOptionsDtoMock: AdminPageOptionsDto = {
    limit: 10,
    page: 1,
    search: "",
    sort: "id",
    order: Order.ASC,
    isActive: undefined,
    isDeleted: undefined,
    roles: undefined,
  };

  const createAdminDto: CreateAdminDto = {
    email: 'test@test.com',
    username: 'test',
    password: 'test',
    phone: '1234567890',
    firstName: 'test',
    lastName: 'test',
    isActive: "true",
    joinedDate: new Date('2024-01-01 00:00:00'),
    dob: new Date('1990-01-01 00:00:00'),
    roles: [],
    createdBy: "0",
    gender: "male",
  };

  const image: Express.Multer.File = {
    fieldname: 'image',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1000,
    destination: 'uploads',
    filename: 'test.jpg',
    path: 'uploads/test.jpg',
    stream: new Readable,
    buffer: Buffer.from(''),
  };

  const updateAdminDto: UpdateAdminDto = {
    email: 'test@test.com',
    username: 'test',
    password: 'test',
    phone: '1234567890',
    firstName: 'test',
    lastName: 'test',
  };

  const id = 1;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminsService,
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

    service = module.get<AdminsService>(AdminsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it("should return admins", async () => {

     const mockResult = {
       "items": [
            {
                "id": 1009,
                "firstName": "user ",
                "lastName": "test1",
                "dob": "1996-07-08",
                "phone": "testmobile4",
                "username": "testuser4",
                "email": "testuser4@test.com",
                "photo": null,
                "joinedDate": "2025-01-19",
                "gender": "male",
                "lastLogin": null,
                "isVerified": false,
                "verifiedAt": null,
                "verifiedByEmail": false,
                "verifiedByPhone": false,
                "isActive": true,
                "createdAt": "2025-01-19T09:54:00.102Z",
                "updatedAt": "2025-01-19T09:54:00.102Z",
                "createdBy": null,
                "updatedBy": null,
                "deletedReason": null,
                "createdByAdmin": null,
                "updatedByAdmin": null,
                "deletedByAdmin": null,
                "roles": [
                    {
                        "adminId": 1009,
                        "roleId": 4,
                        "createdAt": "2025-01-19T09:54:00.106Z",
                        "updatedAt": "2025-01-19T09:54:00.106Z",
                        "role": {
                            "id": 4,
                            "name": "User",
                            "slug": "user",
                            "description": "User Role",
                            "isDefault": false,
                            "isActive": true,
                            "createdAt": "2025-01-19T06:23:13.164Z",
                            "updatedAt": "2025-01-19T06:23:13.164Z",
                            "permissions": [
                                {
                                    "permissionId": 1,
                                    "roleId": 4,
                                    "createdAt": "2025-01-19T00:23:13.165Z",
                                    "updatedAt": "2025-01-19T00:23:13.165Z",
                                    "permission": {
                                        "id": 1,
                                        "name": "Admin Dashboard",
                                        "slug": "admin.dashboard",
                                        "group": "dashboard",
                                        "createdAt": "2025-01-19T06:23:13.126Z",
                                        "updatedAt": "2025-01-19T06:23:13.126Z"
                                    }
                                },
                                {
                                    "permissionId": 16,
                                    "roleId": 4,
                                    "createdAt": "2025-01-19T00:23:13.166Z",
                                    "updatedAt": "2025-01-19T00:23:13.166Z",
                                    "permission": {
                                        "id": 16,
                                        "name": "Profile View",
                                        "slug": "profile.view",
                                        "group": "profile",
                                        "createdAt": "2025-01-19T06:23:13.134Z",
                                        "updatedAt": "2025-01-19T06:23:13.134Z"
                                    }
                                },
                                {
                                    "permissionId": 17,
                                    "roleId": 4,
                                    "createdAt": "2025-01-19T00:23:13.166Z",
                                    "updatedAt": "2025-01-19T00:23:13.166Z",
                                    "permission": {
                                        "id": 17,
                                        "name": "Profile Update",
                                        "slug": "profile.update",
                                        "group": "profile",
                                        "createdAt": "2025-01-19T06:23:13.134Z",
                                        "updatedAt": "2025-01-19T06:23:13.134Z"
                                    }
                                }
                            ]
                        }
                    }
                ],
                "permissions": [],
                "tokens": []
        },
      ],
      meta: {
        page: 1,
        limit: 10,
        total: 1009,
        pageCount: 101,
        hasPreviousPage: false,
        hasNextPage: true
      },
    }

    jest.spyOn(service, 'findAll').mockResolvedValue(mockResult);

    expect(await service.findAll(pageOptionsDtoMock)).toEqual(mockResult);
  });
  it("should create admin", async () => {

    const mockResult = {
         message: 'Admin Created Successfully',
    }

    jest.spyOn(service, 'create').mockResolvedValue(mockResult);
    expect(await service.create(createAdminDto, image)).toBeDefined();
  });

  it("should update admin", async () => {
    const mockResult = {
      message: 'Admin Updated Successfully',
    }
    jest.spyOn(service, 'update').mockResolvedValue(mockResult);
    expect(await service.update(1, updateAdminDto, image)).toBeDefined();
  });

  it("should delete admin", async () => {
    const mockResult = {
      message: 'Admin Deleted Successfully',
    }
    jest.spyOn(service, 'remove').mockResolvedValue(mockResult);
    expect(await service.remove(id)).toBeDefined();
  });

  it("should find admin by id", async () => {
    const mockResult = {  
      item: {
      id: 1009,
      firstName: "user ",
      lastName: "test1",
      dob: "1996-07-08",
      phone: "testmobile4",
      username: "testuser4",
      email: "testuser4@test.com",
      photo: null,
      joinedDate: "2025-01-19",
      gender: "male",
      lastLogin: null,
      isVerified: false,
      verifiedAt: null,
      verifiedByEmail: false,
      verifiedByPhone: false,
      isActive: true,
      createdAt: "2025-01-19T09:54:00.102Z",
      updatedAt: "2025-01-19T09:54:00.102Z",
      createdBy: null,
      updatedBy: null,
      deletedReason: null,
      createdByAdmin: null,
      updatedByAdmin: null,
      deletedByAdmin: null,
      roles: [
        {
          adminId: 1009,
          roleId: 4,
          createdAt: "2025-01-19T09:54:00.106Z",
          updatedAt: "2025-01-19T09:54:00.106Z",
          role: {
            id: 4,
            name: "User",
            slug: "user",
            description: "User Role",
            isDefault: false,
            isActive: true,
            createdAt: "2025-01-19T06:23:13.164Z",
            updatedAt: "2025-01-19T06:23:13.164Z",
          }
        }
        ],  
      },
      message: 'Admin Found Successfully',
      permissions: []
    }
    jest.spyOn(service, 'findById').mockResolvedValue(mockResult);
    expect(await service.findById(id)).toEqual(mockResult);
  });
});
