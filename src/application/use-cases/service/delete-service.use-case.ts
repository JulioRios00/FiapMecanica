import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceRepositoryPort } from '@application/ports/service.repository.port';

@Injectable()
export class DeleteServiceUseCase {
  constructor(private readonly serviceRepository: ServiceRepositoryPort) {}

  async execute(id: string): Promise<void> {
    const service = await this.serviceRepository.findById(id);

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    service.deactivate();
    await this.serviceRepository.update(id, service);
  }
}
