import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { UserType } from "../entities/user.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({
    example: "user@example.com",
    description: "User email address",
  })
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Invalid email format" })
  email: string;

  @ApiProperty({
    example: "password123",
    description: "User password",
    minLength: 8,
  })
  @IsNotEmpty({ message: "Password is required" })
  @IsString({ message: "Password must be a string" })
  @MinLength(8, { message: "Password must be at least 8 characters" })
  password: string;

  @ApiProperty({ example: "User 1", description: "User full name" })
  @IsNotEmpty({ message: "Name is required" })
  @IsString({ message: "Name must be a string" })
  name: string;

  @ApiPropertyOptional({
    enum: UserType,
    default: UserType.VIEWER,
    example: UserType.VIEWER,
    description: "User role type",
  })
  @IsOptional()
  @IsEnum(UserType, { message: "User type must be ADMIN or VIEWER" })
  userType?: UserType;
}
