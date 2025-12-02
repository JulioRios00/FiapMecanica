import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceOrderStatus } from '@prisma/client';
import { ServiceOrderRepositoryPort } from '@application/ports/service-order.repository.port';

@Injectable()
export class UpdateServiceOrderStatusUseCase {
  constructor(
    private readonly serviceOrderRepository: ServiceOrderRepositoryPort,
  ) {}

  async execute(
    id: string,
    status: ServiceOrderStatus,
    reason?: string,
  ): Promise<any> {
    const serviceOrder = await this.serviceOrderRepository.findById(id);

    if (!serviceOrder) {
      throw new NotFoundException('Service Order not found');
    }

    serviceOrder.updateStatus(status);

    return await this.serviceOrderRepository.updateStatus(id, status, reason);
  }
}

