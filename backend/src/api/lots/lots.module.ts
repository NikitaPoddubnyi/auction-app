import { Module } from '@nestjs/common';
import { LotsService } from './lots.service';
import { LotsController } from './lots.controller';
import { CloudinaryModule } from 'src/infra/claudinary/claudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [LotsController],
  providers: [LotsService],
})
export class LotsModule {}
