import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Vehicle, VehicleProps } from '@domain/entities/vehicle.entity';
import { VehicleRepositoryPort } from '@application/ports/vehicle.repository.port';
import { CustomerRepositoryPort } from '@application/ports/customer.repository.port';

@Injectable()
export class CreateVehicleUseCase {
  constructor(
    private readonly vehicleRepository: VehicleRepositoryPort,
    private readonly customerRepository: CustomerRepositoryPort,
  ) {}

  async execute(data: VehicleProps): Promise<Vehicle> {
    // Check if customer exists
    const customer = await this.customerRepository.findById(data.customerId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Check if vehicle with same license plate already exists
    const existingVehicle = await this.vehicleRepository.findByLicensePlate(
      data.licensePlate,
    );

    if (existingVehicle) {
      throw new ConflictException('Vehicle with this license plate already exists');
    }

    const vehicle = new Vehicle(data);
    return await this.vehicleRepository.create(vehicle);
  }
}

