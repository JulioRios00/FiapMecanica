import { Injectable, Logger } from '@nestjs/common';
import { NotificationPort } from '@application/ports/notification.port';

@Injectable()
export class ConsoleNotificationService implements NotificationPort {
  private readonly logger = new Logger(ConsoleNotificationService.name);

  async sendStatusUpdateNotification(params: {
    serviceOrderId: string;
    newStatus: string;
    senderEmail: string;
    message?: string;
  }): Promise<void> {
    this.logger.log(
      `[EMAIL NOTIFICATION] Service Order ${params.serviceOrderId} ` +
        `status updated to ${params.newStatus} ` +
        `by ${params.senderEmail}` +
        (params.message ? ` - Message: ${params.message}` : ''),
    );
  }
}
