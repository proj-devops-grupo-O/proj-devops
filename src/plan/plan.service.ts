import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Plan } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';

@Injectable()
export class PlanService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePlanDto): Promise<Plan> {
    return this.prisma.plan.create({ data });
  }

  async findAll(): Promise<Plan[]> {
    return this.prisma.plan.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string): Promise<Plan> {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }
    return plan;
  }

  async update(id: string, data: UpdatePlanDto): Promise<Plan> {
    await this.findOne(id);
    return this.prisma.plan.update({ where: { id }, data });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.plan.delete({ where: { id } });
  }
}
