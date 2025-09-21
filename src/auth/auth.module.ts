import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory: async (configService: ConfigService) => {
        const expirationTime = parseInt(
          configService.get('JWT_EXPIRATION_TIME') || '3600',
          10,
        );

        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: expirationTime,
          },
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
