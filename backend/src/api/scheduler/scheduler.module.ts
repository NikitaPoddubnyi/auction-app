import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BidsModule } from '../bids/bids.module';
import { GatewayModule } from '../gateway/gateway.module';
import { LotScheduler } from './lot.scheduler';

@Module({
  imports: [ScheduleModule.forRoot(), BidsModule, GatewayModule],
  providers: [LotScheduler],
})
export class SchedulerModule {}
