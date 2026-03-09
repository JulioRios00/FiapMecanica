import { Injectable } from '@nestjs/common';
import { ServiceOrderStatus } from '@prisma/client';
import {
  ServiceOrderRepositoryPort,
  ServiceOrderWithDetails,
} from '@application/ports/service-order.repository.port';

export interface ListServiceOrdersInput {
  status?: ServiceOrderStatus;
  customerId?: string;
  page?: number;
  limit?: number;
  excludeCompleted?: boolean;
  sortByPriority?: boolean;
}

export interface ListServiceOrdersOutput {
  data: ServiceOrderWithDetails[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ListServiceOrdersUseCase {
  constructor(
    private readonly serviceOrderRepository: ServiceOrderRepositoryPort,
  ) {}

  async execute(params?: ListServiceOrdersInput): Promise<ListServiceOrdersOutput> {
    // Default: exclude completed orders and sort by priority
    const excludeCompleted = params?.excludeCompleted ?? true;
    const sortByPriority = params?.sortByPriority ?? true;

    return await this.serviceOrderRepository.findAll({
      ...params,
      excludeCompleted,
      sortByPriority,
    });
  }
}

