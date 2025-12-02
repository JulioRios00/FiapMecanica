import { Part } from '@domain/entities/part.entity';

export interface PartRepositoryPort {
  create(part: Part): Promise<Part>;
  findById(id: string): Promise<Part | null>;
  findByPartNumber(partNumber: string): Promise<Part | null>;
  findLowStock(): Promise<Part[]>;
  findAll(params?: { active?: boolean; page?: number; limit?: number }): Promise<{
    data: Part[];
    total: number;
    page: number;
    limit: number;
  }>;
  update(id: string, part: Part): Promise<Part>;
  delete(id: string): Promise<void>;
}

