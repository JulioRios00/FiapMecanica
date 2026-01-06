import { Injectable } from '@nestjs/common';
import { ServiceRepositoryPort } from '@application/ports/service.repository.port';

@Injectable()
export class ListServicesUseCase {
  constructor(private readonly serviceRepository: ServiceRepositoryPort) {}

  async execute(filters?: { category?: string; active?: boolean }): Promise<any> {
    return await this.serviceRepository.findAll(filters);
  }
}
