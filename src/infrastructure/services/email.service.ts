import { Injectable, Logger } from '@nestjs/common';
import {
  EmailServicePort,
  SendStatusUpdateEmailInput,
} from '@application/ports/email.service.port';

@Injectable()
export class EmailService implements EmailServicePort {
  private readonly logger = new Logger(EmailService.name);

  async sendStatusUpdateEmail(input: SendStatusUpdateEmailInput): Promise<void> {
    try {
      this.logger.log('='.repeat(60));
      this.logger.log('📧 EMAIL NOTIFICATION - Service Order Status Update');
      this.logger.log('='.repeat(60));
      this.logger.log(`To: ${input.customerEmail}`);
      this.logger.log(`Customer: ${input.customerName}`);
      this.logger.log(`Order Number: ${input.orderNumber}`);
      this.logger.log(`Status Change: ${input.previousStatus || 'N/A'} → ${input.newStatus}`);
      if (input.reason) {
        this.logger.log(`Reason: ${input.reason}`);
      }
      this.logger.log('='.repeat(60));
    } catch (error) {
      this.logger.error(`Failed to send status update email for order ${input.orderNumber}`, error);
    }
  }
}
