import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
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
    const customer = await this.customerRepository.findById(data.customerId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const existingVehicle = await this.vehicleRepository.findByLicensePlate(data.licensePlate);

    if (existingVehicle) {
      throw new ConflictException('Vehicle with this license plate already exists');
    }

    try {
      const vehicle = new Vehicle(data);
      return await this.vehicleRepository.create(vehicle);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }
}
