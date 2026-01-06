import { Injectable, NotFoundException } from '@nestjs/common';
import { VehicleRepositoryPort } from '@application/ports/vehicle.repository.port';

@Injectable()
export class GetVehicleUseCase {
  constructor(private readonly vehicleRepository: VehicleRepositoryPort) {}

  async execute(id: string): Promise<any> {
    const vehicle = await this.vehicleRepository.findById(id);

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }
}
