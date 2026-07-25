import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { BillingServicePort } from '../../application/ports/billing-service.port';

/**
 * billing-service has no service catalog/pricing integration exposed to
 * callers yet, so requestQuote stands up a budget with a single placeholder
 * line item derived from the OS description. Replace this once billing
 * exposes real pricing.
 */
const PLACEHOLDER_UNIT_PRICE = 100;

/**
 * HTTP client for the real billing-service (github.com/JulioRios00/... billing
 * repo), matching its actual REST contract:
 *   POST /budgets                  -> create a budget for a service order
 *   PUT  /budgets/:id/approve      -> { approved: boolean } approve/reject
 *   POST /payments                 -> { budgetId, paymentMethod } charge it
 * billing-service does not expose a refund/execution-failure endpoint yet,
 * so notifyExecutionFailure only logs — see the README for that gap.
 */
@Injectable()
export class HttpBillingServiceClient implements BillingServicePort {
  private readonly logger = new Logger(HttpBillingServiceClient.name);
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('BILLING_SERVICE_URL', 'http://localhost:3001/api/v1');
  }

  async requestQuote(payload: {
    osId: string;
    description: string;
    correlationId: string;
  }): Promise<{ budgetId: string }> {
    const { data } = await firstValueFrom(
      this.http.post<{ id: string }>(
        `${this.baseUrl}/budgets`,
        {
          serviceOrderId: payload.osId,
          items: [
            {
              description: payload.description,
              quantity: 1,
              unitPrice: PLACEHOLDER_UNIT_PRICE,
              totalPrice: PLACEHOLDER_UNIT_PRICE,
            },
          ],
        },
        { headers: { 'x-correlation-id': payload.correlationId } },
      ),
    );
    return { budgetId: data.id };
  }

  async confirmPayment(payload: { budgetId: string; correlationId: string }): Promise<void> {
    await firstValueFrom(
      this.http.put(
        `${this.baseUrl}/budgets/${payload.budgetId}/approve`,
        { approved: true },
        { headers: { 'x-correlation-id': payload.correlationId } },
      ),
    );
    await firstValueFrom(
      this.http.post(
        `${this.baseUrl}/payments`,
        { budgetId: payload.budgetId, paymentMethod: 'credit_card' },
        { headers: { 'x-correlation-id': payload.correlationId } },
      ),
    );
  }

  async cancelQuote(payload: { budgetId: string; reason: string; correlationId: string }): Promise<void> {
    await firstValueFrom(
      this.http.put(
        `${this.baseUrl}/budgets/${payload.budgetId}/approve`,
        { approved: false },
        { headers: { 'x-correlation-id': payload.correlationId } },
      ),
    );
  }

  async notifyExecutionFailure(payload: { budgetId: string; reason: string; correlationId: string }): Promise<void> {
    this.logger.warn(
      `billing-service has no refund endpoint yet; execution failure for budget ` +
        `${payload.budgetId} was not reported (${payload.reason})`,
    );
  }
}
