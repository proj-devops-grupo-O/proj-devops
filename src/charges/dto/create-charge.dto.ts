import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateChargeDto {
  @ApiProperty({
    description: "ID of the subscription to charge",
    example: "subscription_1",
  })
  @IsString({ message: "Subscription ID must be a string" })
  subscriptionId: string;

  @ApiProperty({
    description: "Amount to charge in currency units",
    example: 59.9,
    minimum: 0.01,
  })
  @IsNumber({}, { message: "Amount must be a number" })
  @Min(0.01, { message: "Amount must be greater than zero" })
  amount: number;

  @ApiPropertyOptional({
    description: "Date when the charge will be processed",
    example: "2025-09-01T00:00:00Z",
  })
  @IsDateString({}, { message: "Charge date must be in ISO format" })
  chargeDate?: string;

  @ApiPropertyOptional({
    description: "Description of what this charge is for",
    example: "Premium Plan - Monthly Subscription",
  })
  @IsOptional()
  @IsString({ message: "Description must be a string" })
  description?: string;
}
