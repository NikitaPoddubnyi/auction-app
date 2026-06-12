import { Module } from '@nestjs/common';
import { CloudinaryService } from './claudinary.service';
import { CloudinaryProvider } from 'src/common/providers/claudinary.provider';

@Module({
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryProvider, CloudinaryService],
})
export class CloudinaryModule {}
