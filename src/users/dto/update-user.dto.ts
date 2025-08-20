import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { UserType } from "../entities/user.entity";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateUserDto {
  @ApiPropertyOptional({ example: "updated@example.com" })
  @IsOptional()
  @IsEmail({}, { message: "Invalid email format" })
  email?: string;

  @ApiPropertyOptional({
    example: "newpassword123",
    minLength: 8,
  })
  @IsOptional()
  @IsString({ message: "Password must be a string" })
  @MinLength(8, { message: "Password must be at least 8 characters" })
  password?: string;

  @ApiPropertyOptional({ example: "Updated Name" })
  @IsOptional()
  @IsString({ message: "Name must be a string" })
  name?: string;

  @ApiPropertyOptional({
    enum: UserType,
    example: UserType.ADMIN,
  })
  @IsOptional()
  @IsEnum(UserType, { message: "User type must be ADMIN or VIEWER" })
  userType?: UserType;
}
