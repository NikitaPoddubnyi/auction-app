import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterRequest } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Response, Request } from 'express';
import { User } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  const mockRequest = {
    cookies: { refreshToken: 'old-token' },
  } as unknown as Request;

  const mockUser: Partial<User> = {
    id: 'cv356t5346bgrrvrg',
    email: 'test@example.com',
  };

  const mockAuthResponse = {
    accessToken: 'access-token',
    user: mockUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn().mockResolvedValue(mockAuthResponse),
            login: jest.fn().mockResolvedValue(mockAuthResponse),
            refresh: jest.fn().mockResolvedValue(mockAuthResponse),
            logout: jest.fn().mockResolvedValue({ success: true }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a user', async () => {
      const dto: RegisterRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
      };
      const result = await controller.register(mockResponse, dto);

      expect(service.register).toHaveBeenCalledWith(mockResponse, dto);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const result = await controller.login(mockResponse, dto);

      expect(service.login).toHaveBeenCalledWith(mockResponse, dto);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('refresh', () => {
    it('should refresh tokens', async () => {
      const result = await controller.refresh(mockRequest, mockResponse);

      expect(service.refresh).toHaveBeenCalledWith(mockRequest, mockResponse);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const result = await controller.logout(mockResponse);

      expect(service.logout).toHaveBeenCalledWith(mockResponse);
      expect(result).toEqual({ success: true });
    });
  });
});
