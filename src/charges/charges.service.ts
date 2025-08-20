import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateChargeDto } from "./dto/create-charge.dto";
import { UpdateChargeDto } from "./dto/update-charge.dto";
import { Queue } from "bullmq";
import { InjectQueue } from "@nestjs/bullmq";
import { EmailJobData } from "./interfaces";

@Injectable()
export class ChargesService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue("charges") private readonly chargesQueue: Queue
  ) {}

  async createCharge(createChargeDto: CreateChargeDto) {
    const { subscriptionId, amount, chargeDate, description } = createChargeDto;

    const subscription = await this.prisma.activeSubscription.findUnique({
      where: { id: subscriptionId },
      include: {
        customer: true,
        plan: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException("Subscription not found");
    }

    if (subscription.status !== "active") {
      throw new BadRequestException("Subscription is not active");
    }

    const finalChargeDate = chargeDate ? new Date(chargeDate) : new Date();

    const charge = await this.prisma.charge.create({
      data: {
        subscriptionId,
        amount,
        chargeDate: finalChargeDate,
        status: "pending",
        description: description || `${subscription.plan.name} Charge`,
        attempts: 0,
      },
      include: {
        subscription: {
          include: {
            customer: true,
            plan: true,
          },
        },
      },
    });

    await this.scheduleChargeEmail(charge);

    return charge;
  }

  async findCharges(filters?: {
    status?: string;
    customerId?: string;
    subscriptionId?: string;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.subscriptionId) {
      where.subscriptionId = filters.subscriptionId;
    }

    if (filters?.customerId) {
      where.subscription = {
        customerId: filters.customerId,
      };
    }

    return await this.prisma.charge.findMany({
      where,
      include: {
        subscription: {
          include: {
            customer: true,
            plan: true,
          },
        },
      },
      orderBy: {
        chargeDate: "desc",
      },
    });
  }

  async findChargeById(id: string) {
    const charge = await this.prisma.charge.findUnique({
      where: { id },
      include: {
        subscription: {
          include: {
            customer: true,
            plan: true,
          },
        },
        payments: true,
      },
    });

    if (!charge) {
      throw new NotFoundException("Charge not found");
    }

    return charge;
  }

  async updateCharge(id: string, updateChargeDto: UpdateChargeDto) {
    await this.findChargeById(id);

    return await this.prisma.charge.update({
      where: { id },
      data: {
        ...updateChargeDto,
        updatedAt: new Date(),
      },
      include: {
        subscription: {
          include: {
            customer: true,
            plan: true,
          },
        },
      },
    });
  }

  private async scheduleChargeEmail(charge: any) {
    const emailData: EmailJobData = {
      chargeId: charge.id,
      customerEmail: charge.subscription.customer.email,
      customerName: charge.subscription.customer.name,
      amount: charge.amount,
      dueDate: charge.chargeDate.toISOString(),
      planName: charge.subscription.plan.name,
    };

    const delayMs = charge.chargeDate.getTime() - Date.now();
    await this.chargesQueue.add("send-charge-email", emailData, {
      delay: Math.max(delayMs, 0),
      attempts: 5,
      backoff: { type: "exponential", delay: 10_000 },
      removeOnComplete: true,
    });
  }
}
