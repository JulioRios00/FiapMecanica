import { Injectable, NotFoundException } from '@nestjs/common';
import { VehicleRepositoryPort } from '@application/ports/vehicle.repository.port';

@Injectable()
export class DeleteVehicleUseCase {
  constructor(private readonly vehicleRepository: VehicleRepositoryPort) {}

  async execute(id: string): Promise<void> {
    const vehicle = await this.vehicleRepository.findById(id);

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    vehicle.deactivate();
    await this.vehicleRepository.update(id, vehicle);
  }
}
