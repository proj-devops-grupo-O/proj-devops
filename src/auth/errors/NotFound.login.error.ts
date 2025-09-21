import { NotFoundException } from '@nestjs/common';

/**
 * Exceção lançada quando um usuário não é encontrado (HTTP 404).
 */
export class LoginNotFoundError extends NotFoundException {
  constructor(email: string) {
    super(`O usuário '${email}' não foi encontrado.`);
    this.name = this.constructor.name;
  }
}
