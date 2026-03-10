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

const STATUS_PRIORITY: Record<ServiceOrderStatus, number> = {
  [ServiceOrderStatus.IN_PROGRESS]: 1,
  [ServiceOrderStatus.AWAITING_APPROVAL]: 2,
  [ServiceOrderStatus.IN_DIAGNOSIS]: 3,
  [ServiceOrderStatus.RECEIVED]: 4,
  [ServiceOrderStatus.APPROVED]: 5,
  [ServiceOrderStatus.AWAITING_PARTS]: 6,
  [ServiceOrderStatus.COMPLETED]: 7,
  [ServiceOrderStatus.DELIVERED]: 8,
  [ServiceOrderStatus.CANCELLED]: 9,
};

@Injectable()
export class ListServiceOrdersUseCase {
  constructor(private readonly serviceOrderRepository: ServiceOrderRepositoryPort) {}

  async execute(params?: ListServiceOrdersInput): Promise<ListServiceOrdersOutput> {
    const excludeCompleted = params?.excludeCompleted ?? true;
    const sortByPriority = params?.sortByPriority ?? true;

    const result = await this.serviceOrderRepository.findAll({
      status: params?.status,
      customerId: params?.customerId,
      page: params?.page,
      limit: params?.limit,
      excludeCompleted,
    });

    if (sortByPriority) {
      result.data.sort((a, b) => {
        const priorityA = STATUS_PRIORITY[a.getStatus()] ?? 99;
        const priorityB = STATUS_PRIORITY[b.getStatus()] ?? 99;

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        const dateA = a.getCreatedAt()?.getTime() ?? 0;
        const dateB = b.getCreatedAt()?.getTime() ?? 0;
        return dateA - dateB;
      });
    }

    return result;
  }
}
