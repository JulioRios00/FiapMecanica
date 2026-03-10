import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceOrderStatus } from '@prisma/client';
import { ServiceOrder } from '@domain/entities/service-order.entity';
import { ServiceOrderRepositoryPort } from '@application/ports/service-order.repository.port';
import { CustomerRepositoryPort } from '@application/ports/customer.repository.port';
import { EmailServicePort } from '@application/ports/email.service.port';

@Injectable()
export class UpdateServiceOrderStatusUseCase {
  constructor(
    private readonly serviceOrderRepository: ServiceOrderRepositoryPort,
    private readonly customerRepository: CustomerRepositoryPort,
    private readonly emailService: EmailServicePort,
  ) {}

  async execute(id: string, status: ServiceOrderStatus, reason?: string): Promise<ServiceOrder> {
    const serviceOrder = await this.serviceOrderRepository.findById(id);

    if (!serviceOrder) {
      throw new NotFoundException('Service Order not found');
    }

    const previousStatus = serviceOrder.getStatus();
    serviceOrder.updateStatus(status);

    const updated = await this.serviceOrderRepository.updateStatus(id, status, reason);

    // Send email notification to customer
    await this.sendStatusUpdateNotification(updated, previousStatus, status, reason);

    return updated;
  }

  private async sendStatusUpdateNotification(
    serviceOrder: ServiceOrder,
    previousStatus: ServiceOrderStatus,
    newStatus: ServiceOrderStatus,
    reason?: string,
  ): Promise<void> {
    try {
      const customer = await this.customerRepository.findById(serviceOrder.getCustomerId());

      if (customer) {
        await this.emailService.sendStatusUpdateEmail({
          customerEmail: customer.getEmail().getValue(),
          customerName: customer.getName(),
          orderNumber: serviceOrder.getOrderNumber() || serviceOrder.getId() || 'N/A',
          previousStatus,
          newStatus,
          reason,
        });
      }
    } catch (error) {
      // Email failures are logged by the email service but don't block the operation
      console.error('Failed to send status update notification', error);
    }
  }
}
