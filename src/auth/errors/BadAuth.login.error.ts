import { UnauthorizedException } from '@nestjs/common';

/**
 * Exceção lançada quando a autenticação do usuário não foi possível. (HTTP 401).
 */
export class BadAuthLoginError extends UnauthorizedException {
  constructor(message: string = 'Credenciais inválidas.') {
    super(message);
    this.name = this.constructor.name;
  }
}
