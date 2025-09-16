import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserType } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation(() => Promise.resolve('hashed_password')),
  compare: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      userType: UserType.VIEWER,
    };

    it('should create a user successfully', async () => {
      const mockCreatedUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        name: 'Test User',
        userType: UserType.VIEWER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValue(mockCreatedUser);

      const result = await service.create(createUserDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashed_password',
          name: 'Test User',
          userType: UserType.VIEWER,
        },
      });

      expect(result).not.toHaveProperty('passwordHash');
      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        userType: UserType.VIEWER,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should create a user with default VIEWER role when userType is not provided', async () => {
      const dtoWithoutUserType = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const mockCreatedUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        name: 'Test User',
        userType: UserType.VIEWER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValue(mockCreatedUser);

      const result = await service.create(dtoWithoutUserType as CreateUserDto);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashed_password',
          name: 'Test User',
          userType: 'VIEWER',
        },
      });

      expect(result.userType).toEqual(UserType.VIEWER);
    });

    it('should throw ConflictException if email already exists', async () => {
      const existingUser = {
        id: 'existing-user',
        email: 'test@example.com',
        passwordHash: 'existing_hash',
        name: 'Existing User',
        userType: UserType.VIEWER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        'Email already in use',
      );

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });
  });
});
