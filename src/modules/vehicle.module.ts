import { Module } from '@nestjs/common';
import { VehicleController } from '@presentation/controllers/vehicle.controller';
import { CreateVehicleUseCase } from '@application/use-cases/vehicle/create-vehicle.use-case';
import { GetVehicleUseCase } from '@application/use-cases/vehicle/get-vehicle.use-case';
import { ListVehiclesUseCase } from '@application/use-cases/vehicle/list-vehicles.use-case';
import { UpdateVehicleUseCase } from '@application/use-cases/vehicle/update-vehicle.use-case';
import { DeleteVehicleUseCase } from '@application/use-cases/vehicle/delete-vehicle.use-case';
import { VehicleRepository } from '@infrastructure/repositories/vehicle.repository';
import { VehicleRepositoryPort } from '@application/ports/vehicle.repository.port';
import { CustomerRepositoryPort } from '@application/ports/customer.repository.port';
import { CustomerRepository } from '@infrastructure/repositories/customer.repository';
import { PrismaService } from '@infrastructure/database/prisma.service';

@Module({
  controllers: [VehicleController],
  providers: [
    PrismaService,
    {
      provide: VehicleRepositoryPort,
      useClass: VehicleRepository,
    },
    {
      provide: CustomerRepositoryPort,
      useClass: CustomerRepository,
    },
    CreateVehicleUseCase,
    GetVehicleUseCase,
    ListVehiclesUseCase,
    UpdateVehicleUseCase,
    DeleteVehicleUseCase,
  ],
  exports: [VehicleRepositoryPort],
})
export class VehicleModule {}
