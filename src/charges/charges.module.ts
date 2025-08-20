import { Module } from '@nestjs/common';
import { ChargesController } from './charges.controller';
import { ChargesService } from './charges.service';
import { ChargeProcessor } from './charge.processor';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [BullModule.registerQueue({ name: 'charges' })],
  controllers: [ChargesController],
  providers: [ChargesService, ChargeProcessor],
  exports: [ChargesService],
})
export class ChargesModule {}
