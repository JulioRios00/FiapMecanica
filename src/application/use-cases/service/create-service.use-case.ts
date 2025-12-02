import { Injectable } from '@nestjs/common';
import { Service, ServiceProps } from '@domain/entities/service.entity';
import { ServiceRepositoryPort } from '@application/ports/service.repository.port';

@Injectable()
export class CreateServiceUseCase {
  constructor(private readonly serviceRepository: ServiceRepositoryPort) {}

  async execute(data: ServiceProps): Promise<Service> {
    const service = new Service(data);
    return await this.serviceRepository.create(service);
  }
}

