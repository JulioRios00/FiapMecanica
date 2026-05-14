import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ServiceOrderStatus } from '@prisma/client';
import { ServiceOrderRepositoryPort } from '@application/ports/service-order.repository.port';
import { NotificationPort } from '@application/ports/notification.port';

@Injectable()
export class UpdateStatusViaNotificationUseCase {
  constructor(
    private readonly serviceOrderRepository: ServiceOrderRepositoryPort,
    private readonly notificationService: NotificationPort,
  ) {}

  async execute(params: {
    serviceOrderId: string;
    newStatus: ServiceOrderStatus;
    senderEmail: string;
    message?: string;
  }): Promise<any> {
    const serviceOrder = await this.serviceOrderRepository.findById(params.serviceOrderId);

    if (!serviceOrder) {
      throw new NotFoundException('Service Order not found');
    }

    try {
      serviceOrder.updateStatus(params.newStatus);

      const updated = await this.serviceOrderRepository.updateStatus(
        params.serviceOrderId,
        params.newStatus,
        params.message || `Status updated via notification by ${params.senderEmail}`,
      );

      await this.notificationService.sendStatusUpdateNotification({
        serviceOrderId: params.serviceOrderId,
        newStatus: params.newStatus,
        senderEmail: params.senderEmail,
        message: params.message,
      });

      return updated;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
