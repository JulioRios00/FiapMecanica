import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { LocalStrategy } from './local.strategy';
import { AuthService } from '../auth.service';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;

  const mockAuthService = {
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('validate', () => {
    it('should return user when credentials are valid', async () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      };
      const input = {
        email: 'test@example.com',
        password: 'password',
      };

      mockAuthService.validateUser.mockResolvedValue(user);

      const result = await strategy.validate(input.email, input.password);

      expect(result).toEqual(user);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(input.email, input.password);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const input = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(strategy.validate(input.email, input.password)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
    });
  });
});
