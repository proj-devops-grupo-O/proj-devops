import { UnauthorizedException } from '@nestjs/common';

/**
 * Exceção lançada quando um usuário tenta acessar uma rota em que não possui autorização (HTTP 401).
 */
export class UnauthorizedRequestError extends UnauthorizedException {
  constructor() {
    super(`Usuário não autorizado.`);
    this.name = this.constructor.name;
  }
}
