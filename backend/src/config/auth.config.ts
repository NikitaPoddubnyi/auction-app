import { ConfigService } from '@nestjs/config';
import { AuthOptions } from '../common/interfaces/auth-options.interface';

export function getAuthConfig(configService: ConfigService): AuthOptions {
  return {
    accessTokenExp: configService.getOrThrow<string>(
      'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
    ),
    refreshTokenExp: configService.getOrThrow<string>(
      'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
    ),
    cookieDomain: configService.getOrThrow<string>('COOKIE_DOMAIN'),
    jwtSecret: configService.getOrThrow<string>('JWT_SECRET'),
  };
}
