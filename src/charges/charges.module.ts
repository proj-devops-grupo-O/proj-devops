import { Module } from '@nestjs/common';
import { ChargesController } from './charges.controller';
import { ChargesService } from './charges.service';
import { ChargeProcessor } from './charge.processor';
import { BullModule } from '@nestjs/bullmq';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [BullModule.registerQueue({ name: 'charges' }), HttpModule],
  controllers: [ChargesController],
  providers: [ChargesService, ChargeProcessor],
  exports: [ChargesService],
})
export class ChargesModule {}
