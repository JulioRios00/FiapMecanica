import { Injectable } from '@nestjs/common';
import { ServiceCategory } from '@prisma/client';
import { Service } from '@domain/entities/service.entity';
import { ServiceRepositoryPort } from '@application/ports/service.repository.port';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ServiceRepository implements ServiceRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(service: Service): Promise<Service> {
    const data = service.toJSON();
    const created = await this.prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        estimatedDuration: data.estimatedDuration,
        price: data.price,
        category: data.category,
        active: data.active,
      },
    });

    return new Service({
      id: created.id,
      name: created.name,
      description: created.description || undefined,
      estimatedDuration: created.estimatedDuration,
      price: Number(created.price),
      category: created.category,
      active: created.active,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  }

  async findById(id: string): Promise<Service | null> {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) return null;

    return new Service({
      id: service.id,
      name: service.name,
      description: service.description || undefined,
      estimatedDuration: service.estimatedDuration,
      price: Number(service.price),
      category: service.category,
      active: service.active,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    });
  }

  async findByCategory(category: ServiceCategory): Promise<Service[]> {
    const services = await this.prisma.service.findMany({
      where: { category, active: true },
    });

    return services.map(
      (service) =>
        new Service({
          id: service.id,
          name: service.name,
          description: service.description || undefined,
          estimatedDuration: service.estimatedDuration,
          price: Number(service.price),
          category: service.category,
          active: service.active,
          createdAt: service.createdAt,
          updatedAt: service.updatedAt,
        }),
    );
  }

  async findAll(params?: {
    active?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Service[];
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

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.service.count({ where }),
    ]);

    const data = services.map(
      (service) =>
        new Service({
          id: service.id,
          name: service.name,
          description: service.description || undefined,
          estimatedDuration: service.estimatedDuration,
          price: Number(service.price),
          category: service.category,
          active: service.active,
          createdAt: service.createdAt,
          updatedAt: service.updatedAt,
        }),
    );

    return { data, total, page, limit };
  }

  async update(id: string, service: Service): Promise<Service> {
    const data = service.toJSON();
    const updated = await this.prisma.service.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        estimatedDuration: data.estimatedDuration,
        price: data.price,
        category: data.category,
        active: data.active,
      },
    });

    return new Service({
      id: updated.id,
      name: updated.name,
      description: updated.description || undefined,
      estimatedDuration: updated.estimatedDuration,
      price: Number(updated.price),
      category: updated.category,
      active: updated.active,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.service.delete({
      where: { id },
    });
  }
}

