import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { AuthOptionsSymbol } from '../../common/interfaces';
import { PasswordHelper } from '../../common/helpers';
import { Response, Request } from 'express';

const mockRes = {
  cookie: jest.fn(),
  clearCookie: jest.fn(),
} as unknown as Response;

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Микита',
  lastName: 'Піддубний',
  password: 'hashed-password',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('mocked-token'),
  verifyAsync: jest.fn(),
};

const mockConfig = {
  get: jest.fn().mockReturnValue('development'),
  getOrThrow: jest.fn().mockReturnValue('development'), // ← додай
};

const mockAuthOptions = {
  accessTokenExp: '15m',
  refreshTokenExp: '7d',
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
        { provide: AuthOptionsSymbol, useValue: mockAuthOptions },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
    mockJwt.sign.mockReturnValue('mocked-token');
  });

  describe('register', () => {
    const dto = {
      firstName: 'Микита',
      lastName: 'Піддубний',
      email: 'test@example.com',
      password: 'password123',
    };

    it('реєструє користувача і повертає accessToken', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await service.register(mockRes, dto);

      expect(result).toHaveProperty('accessToken');
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it('кидає ConflictException якщо email вже існує', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(mockRes, dto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('хешує пароль перед збереженням', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);
      const hashSpy = jest.spyOn(PasswordHelper, 'hashPassword');

      await service.register(mockRes, dto);

      expect(hashSpy).toHaveBeenCalledWith(dto.password);
    });

    it('встановлює refreshToken cookie', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      await service.register(mockRes, dto);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.any(String),
        expect.objectContaining({ httpOnly: true }),
      );
    });
  });

  describe('login', () => {
    const dto = { email: 'test@example.com', password: 'password123' };

    it('логінить і повертає accessToken', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(PasswordHelper, 'comparePassword').mockResolvedValue(true as never);

      const result = await service.login(mockRes, dto);

      expect(result).toHaveProperty('accessToken');
    });

    it('кидає UnauthorizedException якщо користувач не знайдений', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(mockRes, dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('кидає UnauthorizedException якщо пароль невірний', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(PasswordHelper, 'comparePassword').mockResolvedValue(false as never);

      await expect(service.login(mockRes, dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('встановлює cookie після успішного логіну', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(PasswordHelper, 'comparePassword').mockResolvedValue(true as never);

      await service.login(mockRes, dto);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.any(String),
        expect.objectContaining({ httpOnly: true }),
      );
    });
  });

  describe('logout', () => {
    it('очищає cookie і повертає message', async () => {
      const result = await service.logout(mockRes);

      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.any(Object),
      );
      expect(result).toEqual({ message: 'Logged out' });
    });
  });

  describe('validate', () => {
    it('повертає користувача без пароля', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validate('user-1');

      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('email', mockUser.email);
      expect(result).toHaveProperty('firstName', mockUser.firstName);
    });

    it('кидає NotFoundException якщо користувач не знайдений', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.validate('user-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('refresh', () => {
    const mockReq = {
      cookies: { refreshToken: 'valid-refresh-token' },
    } as unknown as Request;

    it('повертає новий accessToken якщо refresh токен валідний', async () => {
      mockJwt.verifyAsync.mockResolvedValue({ id: 'user-1' });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.refresh(mockReq, mockRes);

      expect(result).toHaveProperty('accessToken');
    });

    it('кидає UnauthorizedException якщо немає refreshToken в cookie', async () => {
      const reqWithoutToken = { cookies: {} } as unknown as Request;

      await expect(
        service.refresh(reqWithoutToken, mockRes),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('кидає UnauthorizedException якщо токен невалідний', async () => {
      mockJwt.verifyAsync.mockRejectedValue(new Error('invalid'));

      await expect(service.refresh(mockReq, mockRes)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('кидає UnauthorizedException якщо користувач не існує', async () => {
      mockJwt.verifyAsync.mockResolvedValue({ id: 'user-1' });
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.refresh(mockReq, mockRes)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});