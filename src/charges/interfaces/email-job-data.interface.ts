import { ApiProperty } from "@nestjs/swagger";

export class EmailJobData {
  @ApiProperty({ example: "charge_123", description: "ID of the charge" })
  chargeId: string;

  @ApiProperty({
    example: "test.user@email.com",
    description: "Customer email address",
  })
  customerEmail: string;

  @ApiProperty({ example: "Test User", description: "Customer name" })
  customerName: string;

  @ApiProperty({ example: 59.9, description: "Amount being charged" })
  amount: number;

  @ApiProperty({
    example: "2025-09-01T00:00:00Z",
    description: "Due date of the charge",
  })
  dueDate: string;

  @ApiProperty({ example: "Premium Plan", description: "Name of the plan" })
  planName: string;
}
