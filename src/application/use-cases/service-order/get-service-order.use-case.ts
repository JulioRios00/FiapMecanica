import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceOrderRepositoryPort } from '@application/ports/service-order.repository.port';

@Injectable()
export class GetServiceOrderUseCase {
  constructor(
    private readonly serviceOrderRepository: ServiceOrderRepositoryPort,
  ) {}

  async execute(id: string): Promise<any> {
    const serviceOrder = await this.serviceOrderRepository.findById(id);

    if (!serviceOrder) {
      throw new NotFoundException('Service Order not found');
    }

    return serviceOrder;
  }
}

