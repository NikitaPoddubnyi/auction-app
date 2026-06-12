import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CloudinaryModule } from './claudinary/claudinary.module';
import { ConfigService } from '@nestjs/config';


@Module({
  imports: [
    PrismaModule,
    CloudinaryModule,
  ],
})
export class InfraModule {}
