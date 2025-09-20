import { Module } from '@nestjs/common';
import { ActiveSubscriptionService } from './active-subscription.service';

@Module({
  providers: [ActiveSubscriptionService],
})
export class ActiveSubscriptionModule {}
