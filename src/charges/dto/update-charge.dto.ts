import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateChargeDto {
  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  @IsIn(['pending', 'paid', 'overdue', 'cancelled'], {
    message: 'Status must be: pending, paid, overdue or cancelled'
  })
  status?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
} 