import { IsOptional, IsString, IsDateString, IsIn } from 'class-validator';

export class UpdateActiveSubscriptionDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  planId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsIn(['active', 'cancelled', 'suspended'])
  status?: string;

  @IsOptional()
  @IsDateString()
  nextBilling?: string;
}
