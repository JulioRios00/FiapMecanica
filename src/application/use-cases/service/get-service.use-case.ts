import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceRepositoryPort } from '@application/ports/service.repository.port';

@Injectable()
export class GetServiceUseCase {
  constructor(private readonly serviceRepository: ServiceRepositoryPort) {}

  async execute(id: string): Promise<any> {
    const service = await this.serviceRepository.findById(id);

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }
}
