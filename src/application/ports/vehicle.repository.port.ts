import { Vehicle } from '@domain/entities/vehicle.entity';

export abstract class VehicleRepositoryPort {
  abstract create(vehicle: Vehicle): Promise<Vehicle>;
  abstract findById(id: string): Promise<Vehicle | null>;
  abstract findByLicensePlate(licensePlate: string): Promise<Vehicle | null>;
  abstract findByCustomerId(customerId: string): Promise<Vehicle[]>;
  abstract findAll(params?: { active?: boolean; page?: number; limit?: number }): Promise<{
    data: Vehicle[];
    total: number;
    page: number;
    limit: number;
  }>;
  abstract update(id: string, vehicle: Vehicle): Promise<Vehicle>;
  abstract delete(id: string): Promise<void>;
}

