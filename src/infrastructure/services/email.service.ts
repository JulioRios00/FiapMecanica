import { Injectable, Logger } from '@nestjs/common';
import {
  EmailServicePort,
  SendStatusUpdateEmailInput,
} from '@application/ports/email.service.port';

@Injectable()
export class EmailService implements EmailServicePort {
  private readonly logger = new Logger(EmailService.name);

  /**
   * Send status update email to customer
   * MVP implementation: Logs to console
   * Production: Integrate with SMTP service (Nodemailer, SendGrid, etc.)
   */
  async sendStatusUpdateEmail(input: SendStatusUpdateEmailInput): Promise<void> {
    try {
      // MVP: Log email details to console
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

      // In production, replace with actual email sending:
      // await this.mailService.sendMail({
      //   to: input.customerEmail,
      //   subject: `Service Order ${input.orderNumber} - Status Update`,
      //   template: 'status-update',
      //   context: { ...input },
      // });
    } catch (error) {
      // Log error but don't throw - email failures shouldn't block status updates
      this.logger.error(`Failed to send status update email for order ${input.orderNumber}`, error);
    }
  }
}
