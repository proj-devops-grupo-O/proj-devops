import { ApiProperty } from "@nestjs/swagger";

export enum UserType {
  ADMIN = "ADMIN",
  VIEWER = "VIEWER",
}

export class User {
  @ApiProperty({ example: "user-123", description: "User ID" })
  id: string;

  @ApiProperty({ example: "user@example.com", description: "Email address" })
  email: string;

  password: string;

  @ApiProperty({ example: "User Test", description: "User full name" })
  name: string;

  @ApiProperty({
    enum: UserType,
    example: UserType.VIEWER,
    description: "User role type",
  })
  userType: UserType;

  @ApiProperty({ example: "2025-08-20T14:30:00.000Z" })
  createdAt: Date;

  @ApiProperty({ example: "2025-08-20T14:30:00.000Z" })
  updatedAt: Date;
}
