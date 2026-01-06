import { Injectable } from '@nestjs/common';
import { PartRepositoryPort } from '@application/ports/part.repository.port';

@Injectable()
export class ListPartsUseCase {
  constructor(private readonly partRepository: PartRepositoryPort) {}

  async execute(filters?: { active?: boolean; lowStock?: boolean }): Promise<any> {
    return await this.partRepository.findAll(filters);
  }
}
