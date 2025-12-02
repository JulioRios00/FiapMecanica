import { Injectable } from '@nestjs/common';
import { Vehicle } from '@domain/entities/vehicle.entity';
import { VehicleRepositoryPort } from '@application/ports/vehicle.repository.port';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class VehicleRepository implements VehicleRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(vehicle: Vehicle): Promise<Vehicle> {
    const data = vehicle.toJSON();
    const created = await this.prisma.vehicle.create({
      data: {
        licensePlate: data.licensePlate,
        brand: data.brand,
        model: data.model,
        year: data.year,
        color: data.color,
        chassisNumber: data.chassisNumber,
        customerId: data.customerId,
        active: data.active,
      },
    });

    return new Vehicle({
      id: created.id,
      licensePlate: created.licensePlate,
      brand: created.brand,
      model: created.model,
      year: created.year,
      color: created.color || undefined,
      chassisNumber: created.chassisNumber || undefined,
      customerId: created.customerId,
      active: created.active,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  }

  async findById(id: string): Promise<Vehicle | null> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) return null;

    return new Vehicle({
      id: vehicle.id,
      licensePlate: vehicle.licensePlate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color || undefined,
      chassisNumber: vehicle.chassisNumber || undefined,
      customerId: vehicle.customerId,
      active: vehicle.active,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    });
  }

  async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { licensePlate },
    });

    if (!vehicle) return null;

    return new Vehicle({
      id: vehicle.id,
      licensePlate: vehicle.licensePlate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color || undefined,
      chassisNumber: vehicle.chassisNumber || undefined,
      customerId: vehicle.customerId,
      active: vehicle.active,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    });
  }

  async findByCustomerId(customerId: string): Promise<Vehicle[]> {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { customerId, active: true },
    });

    return vehicles.map(
      (vehicle) =>
        new Vehicle({
          id: vehicle.id,
          licensePlate: vehicle.licensePlate,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          color: vehicle.color || undefined,
          chassisNumber: vehicle.chassisNumber || undefined,
          customerId: vehicle.customerId,
          active: vehicle.active,
          createdAt: vehicle.createdAt,
          updatedAt: vehicle.updatedAt,
        }),
    );
  }

  async findAll(params?: {
    active?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Vehicle[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params?.active !== undefined) {
      where.active = params.active;
    }

    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    const data = vehicles.map(
      (vehicle) =>
        new Vehicle({
          id: vehicle.id,
          licensePlate: vehicle.licensePlate,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          color: vehicle.color || undefined,
          chassisNumber: vehicle.chassisNumber || undefined,
          customerId: vehicle.customerId,
          active: vehicle.active,
          createdAt: vehicle.createdAt,
          updatedAt: vehicle.updatedAt,
        }),
    );

    return { data, total, page, limit };
  }

  async update(id: string, vehicle: Vehicle): Promise<Vehicle> {
    const data = vehicle.toJSON();
    const updated = await this.prisma.vehicle.update({
      where: { id },
      data: {
        brand: data.brand,
        model: data.model,
        year: data.year,
        color: data.color,
        chassisNumber: data.chassisNumber,
        active: data.active,
      },
    });

    return new Vehicle({
      id: updated.id,
      licensePlate: updated.licensePlate,
      brand: updated.brand,
      model: updated.model,
      year: updated.year,
      color: updated.color || undefined,
      chassisNumber: updated.chassisNumber || undefined,
      customerId: updated.customerId,
      active: updated.active,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.vehicle.delete({
      where: { id },
    });
  }
}

