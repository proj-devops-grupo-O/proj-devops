import { UnauthorizedException } from '@nestjs/common';

/**
 * Exceção lançada quando a senha do usuário não está correta (HTTP 401).
 */
export class WrongPasswordLoginError extends UnauthorizedException {
  constructor() {
    super('A senha do usuário está incorreta.');
    this.name = this.constructor.name;
  }
}
