import { Module } from '@nestjs/common';
import { ActiveSubscriptionService } from './active-subscription.service';
import { ActiveSubscriptionController } from './active-subscription.controller';

@Module({
  providers: [ActiveSubscriptionService],
  controllers: [ActiveSubscriptionController],
})
export class ActiveSubscriptionModule {}
