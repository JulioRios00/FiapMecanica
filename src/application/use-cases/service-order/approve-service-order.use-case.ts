import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ServiceOrderStatus } from '@prisma/client';
import { ServiceOrderRepositoryPort } from '@application/ports/service-order.repository.port';

@Injectable()
export class ApproveServiceOrderUseCase {
  constructor(private readonly serviceOrderRepository: ServiceOrderRepositoryPort) {}

  async execute(
    id: string,
    approvedBy: string,
    approvedAmount?: number,
    approved: boolean = true,
    reason?: string,
  ): Promise<any> {
    const serviceOrder = await this.serviceOrderRepository.findById(id);

    if (!serviceOrder) {
      throw new NotFoundException('Service Order not found');
    }

    try {
      if (approved) {
        serviceOrder.approve(approvedBy, approvedAmount);
        return await this.serviceOrderRepository.update(id, serviceOrder);
      } else {
        serviceOrder.reject(approvedBy, reason);
        return await this.serviceOrderRepository.updateStatus(
          id,
          ServiceOrderStatus.CANCELLED,
          reason || `Rejected by ${approvedBy}`,
        );
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
