import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateChargeDto {
  @IsString({ message: 'Subscription ID must be a string' })
  subscriptionId: string;

  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(0.01, { message: 'Amount must be greater than zero' })
  amount: number;

  @IsDateString({}, { message: 'Charge date must be in ISO format' })
  chargeDate?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
} 