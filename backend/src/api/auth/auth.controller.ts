import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthResponse, LoginDto, RegisterRequest } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOkResponse({
    description: 'Користувач успішно зареєстрований',
    type: AuthResponse,
  })
  @ApiBadRequestResponse({ description: 'Некоректні дані користувача ' })
  @ApiConflictResponse({
    description: 'Користувач з таким email вже існує',
  })
  @ApiOperation({
    summary: 'Регістрація користувача',
    description: 'Реєструє користувача',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: RegisterRequest,
  ) {
    return this.authService.register(res, dto);
  }

  @ApiOkResponse({
    description: 'Користувач успішно авторизований',
    type: AuthResponse,
  })
  @ApiBadRequestResponse({ description: 'Некоректні дані користувача ' })
  @ApiNotFoundResponse({
    description: 'Користувач з таким email не знайдений',
  })
  @ApiOperation({
    summary: 'Авторизує користувача',
    description: 'Авторизує користувача и видає access токен та refresh токен',
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: LoginDto,
  ) {
    return this.authService.login(res, dto);
  }

  @ApiOkResponse({
    description: 'Користувач успішно авторизований',
    type: AuthResponse,
  })
  @ApiUnauthorizedResponse({ description: 'Недійсний access токен' })
  @ApiOperation({
    summary: 'Оновлення токенів',
    description: 'Оновлює access токен та refresh токен',
  })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refresh(req, res);
  }

  @ApiOperation({
    summary: 'Вихід з аккаунту',
    description: 'Вихід з аккаунту',
  })
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }
}
