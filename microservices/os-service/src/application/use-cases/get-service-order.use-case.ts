import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceOrderRepositoryPort } from '../ports/service-order-repository.port';

@Injectable()
export class GetServiceOrderUseCase {
  constructor(private readonly repository: ServiceOrderRepositoryPort) {}

  async execute(id: string) {
    const serviceOrder = await this.repository.findById(id);
    if (!serviceOrder) {
      throw new NotFoundException('Service order not found');
    }
    return serviceOrder;
  }
}

