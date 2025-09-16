import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { WrongPasswordLoginError } from './errors/WrongPassword.login.error';
import { UserType } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compareSync: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findUserByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key) => {
              if (key === 'JWT_EXPIRATION_TIME') return '3600';
              if (key === 'JWT_SECRET') return 'test-secret';
              return null;
            }),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signIn', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      passwordHash: 'hashed_password',
      name: 'Test User',
      userType: UserType.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockToken = 'jwt-token-here';

    it('should sign in a user and return a token', async () => {
      jest.spyOn(usersService, 'findUserByEmail').mockResolvedValue(mockUser);

      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);

      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(mockToken);

      const result = await authService.signIn(
        'test@example.com',
        'password123',
      );

      expect(usersService.findUserByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(bcrypt.compareSync).toHaveBeenCalledWith(
        'password123',
        'hashed_password',
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'test@example.com',
        role: 'ADMIN',
      });

      expect(result).toEqual({
        token: mockToken,
        expiresIn: 3600,
        role: 'ADMIN',
      });
    });

    it('should throw WrongPasswordLoginError when password is incorrect', async () => {
      jest.spyOn(usersService, 'findUserByEmail').mockResolvedValue(mockUser);

      (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

      await expect(
        authService.signIn('test@example.com', 'wrong_password'),
      ).rejects.toThrow(WrongPasswordLoginError);

      expect(usersService.findUserByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(bcrypt.compareSync).toHaveBeenCalledWith(
        'wrong_password',
        'hashed_password',
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw error when user is not found', async () => {
      jest
        .spyOn(usersService, 'findUserByEmail')
        .mockRejectedValue(new Error('User not found'));

      await expect(
        authService.signIn('nonexistent@example.com', 'password123'),
      ).rejects.toThrow('User not found');

      expect(usersService.findUserByEmail).toHaveBeenCalledWith(
        'nonexistent@example.com',
      );
      expect(bcrypt.compareSync).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
