import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dtos/create-customer.dto';
import { UpdateCustomerDto } from './dtos/update-customer.dto';
import { Customer } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCustomerDto): Promise<Customer> {
    const existing = await this.prisma.customer.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }
    return this.prisma.customer.create({ data });
  }

  async findAll(): Promise<Customer[]> {
    return this.prisma.customer.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async update(id: string, data: UpdateCustomerDto): Promise<Customer> {
    await this.findOne(id);
    try {
      return await this.prisma.customer.update({
        where: { id },
        data,
      });
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException('Email already in use');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.customer.delete({
      where: { id },
    });
  }
}
