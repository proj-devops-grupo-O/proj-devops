import { USER_ROLES } from '@/enums/userRoles.enum';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthResponseDTO {
  token: string;
  expiresIn: number;
  role: USER_ROLES;
}

export class SignInDTO {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
