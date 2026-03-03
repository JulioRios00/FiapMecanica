import { Injectable } from '@nestjs/common';
import { ServiceOrderStatus } from '@prisma/client';
import { ServiceOrderRepositoryPort } from '@application/ports/service-order.repository.port';

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
  constructor(
    private readonly serviceOrderRepository: ServiceOrderRepositoryPort,
  ) {}

  async execute(params?: {
    status?: ServiceOrderStatus;
    customerId?: string;
    page?: number;
    limit?: number;
    excludeFinalized?: boolean;
  }): Promise<any> {
    const excludeFinalized = params?.excludeFinalized ?? true;

    const result = await this.serviceOrderRepository.findAll({
      ...params,
      excludeFinalized,
    });

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

    return result;
  }
}
