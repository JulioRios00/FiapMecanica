import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { BillingServicePort } from '../../application/ports/billing-service.port';

/**
 * Contract-compliant HTTP client for the Billing Service. Owned by a different
 * team; point BILLING_SERVICE_URL at their deployment once it exists. Until
 * then, saga-orchestrator defaults to MockBillingServiceClient (see infra/mocks).
 */
@Injectable()
export class HttpBillingServiceClient implements BillingServicePort {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('BILLING_SERVICE_URL', 'http://localhost:3030/api/v1');
  }

  async requestQuote(payload: { osId: string; correlationId: string }): Promise<void> {
    await firstValueFrom(
      this.http.post(
        `${this.baseUrl}/quotes`,
        { osId: payload.osId },
        { headers: { 'x-correlation-id': payload.correlationId } },
      ),
    );
  }

  async confirmPayment(payload: { osId: string; correlationId: string }): Promise<void> {
    await firstValueFrom(
      this.http.post(
        `${this.baseUrl}/quotes/${payload.osId}/confirm-payment`,
        {},
        { headers: { 'x-correlation-id': payload.correlationId } },
      ),
    );
  }

  async cancelQuote(payload: { osId: string; reason: string; correlationId: string }): Promise<void> {
    await firstValueFrom(
      this.http.post(
        `${this.baseUrl}/quotes/${payload.osId}/cancel`,
        { reason: payload.reason },
        { headers: { 'x-correlation-id': payload.correlationId } },
      ),
    );
  }

  async notifyExecutionFailure(payload: { osId: string; reason: string; correlationId: string }): Promise<void> {
    await firstValueFrom(
      this.http.post(
        `${this.baseUrl}/quotes/${payload.osId}/execution-failed`,
        { reason: payload.reason },
        { headers: { 'x-correlation-id': payload.correlationId } },
      ),
    );
  }
}
