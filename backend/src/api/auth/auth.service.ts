import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { PasswordHelper } from '../../common/helpers';
import {
  type AuthOptions,
  AuthOptionsSymbol,
  type JwtPayload,
} from '../../common/interfaces';
import { isDev } from '../../common/utils';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { LoginDto, RegisterRequest } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(AuthOptionsSymbol) private readonly options: AuthOptions,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async register(res: Response, dto: RegisterRequest) {
    const { firstName, lastName, email, password} = dto;
    const existUser = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (existUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = PasswordHelper.hashPassword(password);

    const user = await this.prismaService.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
      },
    });

    return this.auth(res, user.id);
  }

  async login(res: Response, dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await PasswordHelper.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.auth(res, user.id);
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const payload: JwtPayload =
        await this.jwtService.verifyAsync(refreshToken);

      const user = await this.prismaService.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) {
        await this.logout(res);
        throw new UnauthorizedException('User no longer exists');
      }

      return this.auth(res, user.id);
    } catch (e) {
      await this.logout(res);
      throw new UnauthorizedException('Session expired');
    }
  }

  async logout(res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: !isDev(this.configService),
      sameSite: !isDev(this.configService) ? 'none' : 'lax',
      path: '/',
      // domain: this.options.cookieDomain,
    });
    return { message: 'Logged out' };
  }

  async validate(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...result } = user;
    return result;
  }

  private generateTokens(id: string) {
    const payload: JwtPayload = { id };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.options.accessTokenExp as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.options.refreshTokenExp as any,
    });

    return { accessToken, refreshToken };
  }

  private setCookie(res: Response, value: string, expiresIn: Date) {
    res.cookie('refreshToken', value, {
      httpOnly: true,
      expires: expiresIn,
      // domain: this.options.cookieDomain,
      secure: !isDev(this.configService),
      sameSite: !isDev(this.configService) ? 'none' : 'lax',
      path: '/',
    });
  }

  private auth(res: Response, id: string) {
    const { accessToken, refreshToken } = this.generateTokens(id);
    const expiresInMs = this.parseExpirationTime(
      this.options.refreshTokenExp as any,
    );
    const expires = new Date(Date.now() + expiresInMs);

    this.setCookie(res, refreshToken, expires);

    return { accessToken };
  }

  private parseExpirationTime(exp: string): number {
    const unit = exp.slice(-1);
    const value = parseInt(exp.slice(0, -1));

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }
}
