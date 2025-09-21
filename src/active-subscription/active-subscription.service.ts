import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateActiveSubscriptionDto } from './dtos/create-active-subscription.dto';
import { UpdateActiveSubscriptionDto } from './dtos/update-active-subscription.dto';
import { ActiveSubscription } from '@prisma/client';

@Injectable()
export class ActiveSubscriptionService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateActiveSubscriptionDto): Promise<ActiveSubscription> {
    return this.prisma.activeSubscription.create({ data });
  }

  async findAll(): Promise<ActiveSubscription[]> {
    return this.prisma.activeSubscription.findMany({
      include: {
        customer: true,
        plan: true,
        charges: true,
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(id: string): Promise<ActiveSubscription> {
    const subscription = await this.prisma.activeSubscription.findUnique({
      where: { id },
      include: {
        customer: true,
        plan: true,
        charges: true,
      },
    });
    if (!subscription) {
      throw new NotFoundException('Active subscription not found');
    }
    return subscription;
  }

  async update(
    id: string,
    data: UpdateActiveSubscriptionDto,
  ): Promise<ActiveSubscription> {
    await this.findOne(id);
    return this.prisma.activeSubscription.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.activeSubscription.delete({
      where: { id },
    });
  }
}
