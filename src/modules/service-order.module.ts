import { Module } from '@nestjs/common';
import { ServiceOrderController } from '@presentation/controllers/service-order.controller';
import { CreateServiceOrderUseCase } from '@application/use-cases/service-order/create-service-order.use-case';
import { GetServiceOrderUseCase } from '@application/use-cases/service-order/get-service-order.use-case';
import { ListServiceOrdersUseCase } from '@application/use-cases/service-order/list-service-orders.use-case';
import { UpdateServiceOrderStatusUseCase } from '@application/use-cases/service-order/update-service-order-status.use-case';
import { ApproveServiceOrderUseCase } from '@application/use-cases/service-order/approve-service-order.use-case';
import { GetServiceExecutionMetricsUseCase } from '@application/use-cases/service-order/get-service-execution-metrics.use-case';
import { UpdateStatusViaNotificationUseCase } from '@application/use-cases/service-order/update-status-via-notification.use-case';
import { NotificationPort } from '@application/ports/notification.port';
import { ConsoleNotificationService } from '@infrastructure/notifications/console-notification.service';
import { ServiceOrderRepository } from '@infrastructure/repositories/service-order.repository';
import { ServiceOrderRepositoryPort } from '@application/ports/service-order.repository.port';
import { CustomerRepository } from '@infrastructure/repositories/customer.repository';
import { CustomerRepositoryPort } from '@application/ports/customer.repository.port';
import { VehicleRepository } from '@infrastructure/repositories/vehicle.repository';
import { VehicleRepositoryPort } from '@application/ports/vehicle.repository.port';
import { ServiceRepository } from '@infrastructure/repositories/service.repository';
import { ServiceRepositoryPort } from '@application/ports/service.repository.port';
import { PartRepository } from '@infrastructure/repositories/part.repository';
import { PartRepositoryPort } from '@application/ports/part.repository.port';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { EmailModule } from './email.module';

@Module({
  imports: [EmailModule],
  controllers: [ServiceOrderController],
  providers: [
    PrismaService,
    {
      provide: ServiceOrderRepositoryPort,
      useClass: ServiceOrderRepository,
    },
    {
      provide: CustomerRepositoryPort,
      useClass: CustomerRepository,
    },
    {
      provide: VehicleRepositoryPort,
      useClass: VehicleRepository,
    },
    {
      provide: ServiceRepositoryPort,
      useClass: ServiceRepository,
    },
    {
      provide: PartRepositoryPort,
      useClass: PartRepository,
    },
    {
      provide: NotificationPort,
      useClass: ConsoleNotificationService,
    },
    CreateServiceOrderUseCase,
    GetServiceOrderUseCase,
    ListServiceOrdersUseCase,
    UpdateServiceOrderStatusUseCase,
    ApproveServiceOrderUseCase,
    GetServiceExecutionMetricsUseCase,
    UpdateStatusViaNotificationUseCase,
  ],
})
export class ServiceOrderModule {}
