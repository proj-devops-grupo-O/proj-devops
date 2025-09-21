import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsIn,
} from 'class-validator';

export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  @IsIn(['monthly', 'yearly'])
  recurrence?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
