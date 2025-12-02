import { Service } from '@domain/entities/service.entity';
import { ServiceCategory } from '@prisma/client';

export interface ServiceRepositoryPort {
  create(service: Service): Promise<Service>;
  findById(id: string): Promise<Service | null>;
  findByCategory(category: ServiceCategory): Promise<Service[]>;
  findAll(params?: { active?: boolean; page?: number; limit?: number }): Promise<{
    data: Service[];
    total: number;
    page: number;
    limit: number;
  }>;
  update(id: string, service: Service): Promise<Service>;
  delete(id: string): Promise<void>;
}

