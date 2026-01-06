import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceRepositoryPort } from '@application/ports/service.repository.port';

@Injectable()
export class UpdateServiceUseCase {
  constructor(private readonly serviceRepository: ServiceRepositoryPort) {}

  async execute(id: string, data: any): Promise<any> {
    const existingService = await this.serviceRepository.findById(id);

    if (!existingService) {
      throw new NotFoundException('Service not found');
    }

    existingService.updateInfo(data);
    return await this.serviceRepository.update(id, existingService);
  }
}
