import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthResponseDTO } from './auth.dto';
import { compareSync as bcryptCompareSync } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { USER_ROLES } from 'src/enums/userRoles.enum';
import { WrongPasswordLoginError } from './errors/WrongPassword.login.error';
import { UsersService } from '@/users/users.service';

@Injectable()
export class AuthService {
  private jwtExpirationTimeInSeconds: number;

  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtExpirationTimeInSeconds = +this.configService.get<number>(
      'JWT_EXPIRATION_TIME',
    );
  }

  async signIn(email: string, password: string): Promise<AuthResponseDTO> {
    const foundUser = await this.userService.findUserByEmail(email);
    const hash = foundUser.passwordHash;
    if (!bcryptCompareSync(password, hash)) {
      throw new WrongPasswordLoginError();
    }

    const payload = { sub: foundUser.email, role: foundUser.userType };

    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      expiresIn: this.jwtExpirationTimeInSeconds,
      role: foundUser.userType as USER_ROLES,
    };
  }

  /* async signIn(cpf: string, senha: string): Promise<AuthResponseDTO> {
        const foundAdmin = await this.adminService.getHashByCpf(cpf);
        if (!foundAdmin) {
            throw new BadAuthLoginError();
        }

        const hash = foundAdmin.senha_hash;
        if (!bcryptCompareSync(senha, hash)) {
            throw new BadAuthLoginError();
        }

        // TO DO: implementar a checagem de user role

        const payload = { sub: foundAdmin.cpf, role: foundAdmin.role };

        const token = await this.jwtService.signAsync(payload);

        return { token, expiresIn: this.jwtExpirationTimeInSeconds };
    } */
}
