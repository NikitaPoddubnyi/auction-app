import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getAuthConfig } from '../config/auth.config';
import { LotsModule } from './lots/lots.module';
import { BidsModule } from './bids/bids.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [
    AuthModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getAuthConfig,
      inject: [ConfigService],
    }),
    LotsModule,
    BidsModule,
    SchedulerModule,
    GatewayModule,
  ],
})
export class ApiModule {}
