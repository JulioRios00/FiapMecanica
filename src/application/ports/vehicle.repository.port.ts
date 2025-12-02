import { Vehicle } from '@domain/entities/vehicle.entity';

export interface VehicleRepositoryPort {
  create(vehicle: Vehicle): Promise<Vehicle>;
  findById(id: string): Promise<Vehicle | null>;
  findByLicensePlate(licensePlate: string): Promise<Vehicle | null>;
  findByCustomerId(customerId: string): Promise<Vehicle[]>;
  findAll(params?: { active?: boolean; page?: number; limit?: number }): Promise<{
    data: Vehicle[];
    total: number;
    page: number;
    limit: number;
  }>;
  update(id: string, vehicle: Vehicle): Promise<Vehicle>;
  delete(id: string): Promise<void>;
}

