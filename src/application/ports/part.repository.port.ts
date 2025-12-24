import { Part } from '@domain/entities/part.entity';

export abstract class PartRepositoryPort {
  abstract create(part: Part): Promise<Part>;
  abstract findById(id: string): Promise<Part | null>;
  abstract findByPartNumber(partNumber: string): Promise<Part | null>;
  abstract findLowStock(): Promise<Part[]>;
  abstract findAll(params?: { active?: boolean; page?: number; limit?: number }): Promise<{
    data: Part[];
    total: number;
    page: number;
    limit: number;
  }>;
  abstract update(id: string, part: Part): Promise<Part>;
  abstract delete(id: string): Promise<void>;
}

