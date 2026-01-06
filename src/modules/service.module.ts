import { Module } from '@nestjs/common';
import { ServiceController } from '@presentation/controllers/service.controller';
import { CreateServiceUseCase } from '@application/use-cases/service/create-service.use-case';
import { GetServiceUseCase } from '@application/use-cases/service/get-service.use-case';
import { ListServicesUseCase } from '@application/use-cases/service/list-services.use-case';
import { UpdateServiceUseCase } from '@application/use-cases/service/update-service.use-case';
import { DeleteServiceUseCase } from '@application/use-cases/service/delete-service.use-case';
import { ServiceRepository } from '@infrastructure/repositories/service.repository';
import { ServiceRepositoryPort } from '@application/ports/service.repository.port';
import { PrismaService } from '@infrastructure/database/prisma.service';

@Module({
  controllers: [ServiceController],
  providers: [
    PrismaService,
    {
      provide: ServiceRepositoryPort,
      useClass: ServiceRepository,
    },
    CreateServiceUseCase,
    GetServiceUseCase,
    ListServicesUseCase,
    UpdateServiceUseCase,
    DeleteServiceUseCase,
  ],
  exports: [ServiceRepositoryPort],
})
export class ServiceModule {}
