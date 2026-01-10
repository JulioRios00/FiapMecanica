import * as bcrypt from 'bcrypt';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../database/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

const user = {
  id: 'user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER',
};
const hashedPassword = 'hashed-password';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...user,
        password: hashedPassword,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual(user);
      expect(bcrypt.compare).toHaveBeenCalledWith('password', hashedPassword);
    });

    it('should return null when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...user,
        password: hashedPassword,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrong-password');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(user);

      expect(result).toEqual({
        access_token: 'jwt-token',
        user,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
        role: user.role,
      });
    });
  });

  describe('register', () => {
    it('should register a new user and return user without password', async () => {
      const userData = {
        ...user,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue(userData);

      const result = await service.register('test@example.com', 'password', 'Test User');

      expect(result).toEqual({
        ...user,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
          name: 'Test User',
        },
      });
    });
  });
});
