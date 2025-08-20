import { ApiProperty } from '@nestjs/swagger';

export class Charge {
  @ApiProperty({ example: 'charge_123', description: 'Charge ID' })
  id: string;

  @ApiProperty({
    example: 'subscription_1',
    description: 'ID of the subscription',
  })
  subscriptionId: string;

  @ApiProperty({ example: 59.9, description: 'Amount to charge' })
  amount: number;

  @ApiProperty({
    example: '2025-08-20T14:30:00.000Z',
    description: 'When the charge is scheduled for',
  })
  chargeDate: Date;

  @ApiProperty({
    example: 'pending',
    enum: ['pending', 'paid', 'overdue', 'cancelled'],
    description: 'Status of the charge',
  })
  status: string;

  @ApiProperty({
    example: 'Premium Plan - Monthly Subscription',
    description: 'Description of the charge',
  })
  description: string;

  @ApiProperty({ example: 0, description: 'Number of charge attempts' })
  attempts: number;

  @ApiProperty({ example: '2025-08-20T14:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-08-20T14:30:00.000Z' })
  updatedAt: Date;
}
