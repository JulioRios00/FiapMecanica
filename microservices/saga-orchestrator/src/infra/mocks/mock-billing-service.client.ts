import { Injectable, Logger } from '@nestjs/common';
import { BillingServicePort } from '../../application/ports/billing-service.port';
import { simulateFailureIfRequested } from './simulated-failure';

@Injectable()
export class MockBillingServiceClient implements BillingServicePort {
  private readonly logger = new Logger(MockBillingServiceClient.name);

  async requestQuote(payload: { osId: string; correlationId: string }): Promise<void> {
    simulateFailureIfRequested('REQUEST_QUOTE', payload.correlationId);
    this.logger.log(`[mock] quote requested for OS ${payload.osId}`);
  }

  async confirmPayment(payload: { osId: string; correlationId: string }): Promise<void> {
    simulateFailureIfRequested('CONFIRM_PAYMENT', payload.correlationId);
    this.logger.log(`[mock] payment confirmed for OS ${payload.osId}`);
  }

  async cancelQuote(payload: { osId: string; reason: string; correlationId: string }): Promise<void> {
    this.logger.log(`[mock] quote cancelled for OS ${payload.osId} (${payload.reason})`);
  }

  async notifyExecutionFailure(payload: { osId: string; reason: string; correlationId: string }): Promise<void> {
    this.logger.log(`[mock] execution failure notified for OS ${payload.osId} (${payload.reason})`);
  }
}
