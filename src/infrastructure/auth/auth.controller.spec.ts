import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return login result', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      };

      const mockRequest = {
        user: mockUser,
      };

      const expectedResult = {
        access_token: 'jwt-token',
        user: mockUser,
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(mockRequest);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const expectedResult = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.register).toHaveBeenCalledWith(
        registerDto.email,
        registerDto.password,
        registerDto.name,
      );
    });
  });
});
