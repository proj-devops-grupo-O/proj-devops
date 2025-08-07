import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChargesModule } from './charges/charges.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ChargesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
