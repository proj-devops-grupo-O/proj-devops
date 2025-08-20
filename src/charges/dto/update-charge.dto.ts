import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateChargeDto {
  @ApiPropertyOptional({
    description: 'Status of the charge',
    enum: ['pending', 'paid', 'overdue', 'cancelled'],
    example: 'paid',
  })
  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  @IsIn(['pending', 'paid', 'overdue', 'cancelled'], {
    message: 'Status must be: pending, paid, overdue or cancelled',
  })
  status?: string;

  @ApiPropertyOptional({
    description: 'Description of the charge',
    example: 'Payment received via credit card',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}
