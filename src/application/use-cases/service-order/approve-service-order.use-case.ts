import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ServiceOrderRepositoryPort } from '@application/ports/service-order.repository.port';

@Injectable()
export class ApproveServiceOrderUseCase {
  constructor(
    private readonly serviceOrderRepository: ServiceOrderRepositoryPort,
  ) {}

  async execute(
    id: string,
    approvedBy: string,
    approvedAmount?: number,
  ): Promise<any> {
    const serviceOrder = await this.serviceOrderRepository.findById(id);

    if (!serviceOrder) {
      throw new NotFoundException('Service Order not found');
    }

    try {
      serviceOrder.approve(approvedBy, approvedAmount);
      return await this.serviceOrderRepository.update(id, serviceOrder);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}

