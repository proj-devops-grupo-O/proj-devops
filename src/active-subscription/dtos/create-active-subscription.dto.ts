import { IsNotEmpty, IsString, IsDateString, IsIn } from 'class-validator';

export class CreateActiveSubscriptionDto {
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @IsNotEmpty()
  @IsString()
  planId: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsIn(['active', 'cancelled', 'suspended'])
  status: string;

  @IsNotEmpty()
  @IsDateString()
  nextBilling: string;
}
