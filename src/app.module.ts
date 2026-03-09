import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@infrastructure/auth/auth.module';
import { CustomerModule } from './modules/customer.module';
import { ServiceOrderModule } from './modules/service-order.module';
import { VehicleModule } from './modules/vehicle.module';
import { ServiceModule } from './modules/service.module';
import { PartModule } from './modules/part.module';
import { HealthModule } from './modules/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    HealthModule,
    CustomerModule,
    VehicleModule,
    ServiceModule,
    PartModule,
    ServiceOrderModule,
    HealthModule,
  ],
})
export class AppModule {}
