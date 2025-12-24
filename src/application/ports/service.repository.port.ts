import { Service } from '@domain/entities/service.entity';
import { ServiceCategory } from '@prisma/client';

export abstract class ServiceRepositoryPort {
  abstract create(service: Service): Promise<Service>;
  abstract findById(id: string): Promise<Service | null>;
  abstract findByCategory(category: ServiceCategory): Promise<Service[]>;
  abstract findAll(params?: { active?: boolean; page?: number; limit?: number }): Promise<{
    data: Service[];
    total: number;
    page: number;
    limit: number;
  }>;
  abstract update(id: string, service: Service): Promise<Service>;
  abstract delete(id: string): Promise<void>;
}

