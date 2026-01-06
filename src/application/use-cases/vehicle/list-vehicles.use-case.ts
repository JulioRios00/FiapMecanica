import { Injectable } from '@nestjs/common';
import { VehicleRepositoryPort } from '@application/ports/vehicle.repository.port';

@Injectable()
export class ListVehiclesUseCase {
  constructor(private readonly vehicleRepository: VehicleRepositoryPort) {}

  async execute(filters?: { customerId?: string; active?: boolean }): Promise<any> {
    return await this.vehicleRepository.findAll(filters);
  }
}
