import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

export const AuthOptionsSymbol = Symbol('AuthOptions');

export type AuthOptions = {
  accessTokenExp: string | number;
  refreshTokenExp: string | number;
  cookieDomain: string;
  jwtSecret: string;
};

export type AuthAsyncOptions = Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider<AuthOptions>, 'useFactory' | 'inject'>;
