import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@infrastructure/auth/auth.module';
import { CustomerModule } from './modules/customer.module';
import { ServiceOrderModule } from './modules/service-order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    CustomerModule,
    ServiceOrderModule,
  ],
})
export class AppModule {}

