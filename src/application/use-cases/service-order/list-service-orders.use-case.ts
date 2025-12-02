import { Injectable } from '@nestjs/common';
import { ServiceOrderStatus } from '@prisma/client';
import { ServiceOrderRepositoryPort } from '@application/ports/service-order.repository.port';

@Injectable()
export class ListServiceOrdersUseCase {
  constructor(
    private readonly serviceOrderRepository: ServiceOrderRepositoryPort,
  ) {}

  async execute(params?: {
    status?: ServiceOrderStatus;
    customerId?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    return await this.serviceOrderRepository.findAll(params);
  }
}

