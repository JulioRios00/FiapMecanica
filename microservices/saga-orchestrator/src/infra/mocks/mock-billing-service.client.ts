import { Injectable, Logger } from '@nestjs/common';
import { BillingServicePort } from '../../application/ports/billing-service.port';
import { simulateFailureIfRequested } from './simulated-failure';

@Injectable()
export class MockBillingServiceClient implements BillingServicePort {
  private readonly logger = new Logger(MockBillingServiceClient.name);

  async requestQuote(payload: { osId: string; description: string; correlationId: string }): Promise<{
    budgetId: string;
  }> {
    simulateFailureIfRequested('REQUEST_QUOTE', payload.correlationId);
    const budgetId = `mock-budget-${payload.osId}`;
    this.logger.log(`[mock] quote requested for OS ${payload.osId} -> budget ${budgetId}`);
    return { budgetId };
  }

  async confirmPayment(payload: { budgetId: string; correlationId: string }): Promise<void> {
    simulateFailureIfRequested('CONFIRM_PAYMENT', payload.correlationId);
    this.logger.log(`[mock] payment confirmed for budget ${payload.budgetId}`);
  }

  async cancelQuote(payload: { budgetId: string; reason: string; correlationId: string }): Promise<void> {
    this.logger.log(`[mock] quote cancelled for budget ${payload.budgetId} (${payload.reason})`);
  }

  async notifyExecutionFailure(payload: { budgetId: string; reason: string; correlationId: string }): Promise<void> {
    this.logger.log(`[mock] execution failure notified for budget ${payload.budgetId} (${payload.reason})`);
  }
}
