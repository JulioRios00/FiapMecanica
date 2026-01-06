import { Injectable, NotFoundException } from '@nestjs/common';
import { VehicleRepositoryPort } from '@application/ports/vehicle.repository.port';

@Injectable()
export class UpdateVehicleUseCase {
  constructor(private readonly vehicleRepository: VehicleRepositoryPort) {}

  async execute(id: string, data: any): Promise<any> {
    const existingVehicle = await this.vehicleRepository.findById(id);

    if (!existingVehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    existingVehicle.updateInfo(data);
    return await this.vehicleRepository.update(id, existingVehicle);
  }
}
