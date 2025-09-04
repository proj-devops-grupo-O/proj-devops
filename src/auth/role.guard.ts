import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  Type,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { USER_ROLES } from 'src/enums/userRoles.enum';
import { UnauthorizedRequestError } from './errors/Unauthorized.request.error';

export const RoleGuard = (roles: USER_ROLES[]): Type<CanActivate> => {
  @Injectable()
  class RoleGuardMixin implements CanActivate {
    constructor(
      private readonly jwtService: JwtService,
      private readonly configService: ConfigService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();
      const token = this.extractTokenFromHeader(request);

      if (!token) {
        return false;
      }

      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get<string>('JWT_SECRET'),
        });

        if (!roles.includes(payload.role)) {
          throw new UnauthorizedRequestError();
        }

        return true;
      } catch (error) {
        if (error instanceof UnauthorizedRequestError) {
          throw error;
        }
        return false;
      }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') || [];
      return type === 'Bearer' ? token : undefined;
    }
  }

  return mixin(RoleGuardMixin);
};
