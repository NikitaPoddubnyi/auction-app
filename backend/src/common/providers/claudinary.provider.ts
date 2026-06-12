import { ConfigService } from '@nestjs/config';
import { getClaudinaryConfig } from 'src/config';

export const CLOUDINARY_OPTIONS_SYMBOL = Symbol('CloudinaryOptions');

export const CloudinaryProvider = {
  provide: CLOUDINARY_OPTIONS_SYMBOL,
  useFactory: getClaudinaryConfig,
  inject: [ConfigService],
};
