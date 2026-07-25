import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { OsServicePort } from '../../application/ports/os-service.port';

@Injectable()
export class HttpOsServiceClient implements OsServicePort {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('OS_SERVICE_URL', 'http://localhost:3010/api/v1');
  }

  async openServiceOrder(payload: { description: string; correlationId: string }): Promise<{ id: string }> {
    const { data } = await firstValueFrom(
      this.http.post<{ id: string }>(
        `${this.baseUrl}/service-orders`,
        { description: payload.description },
        { headers: { 'x-correlation-id': payload.correlationId } },
      ),
    );
    return { id: data.id };
  }

  async updateStatus(payload: {
    id: string;
    status: string;
    reason?: string;
    correlationId: string;
  }): Promise<void> {
    await firstValueFrom(
      this.http.patch(
        `${this.baseUrl}/service-orders/${payload.id}/status`,
        { status: payload.status, reason: payload.reason },
        { headers: { 'x-correlation-id': payload.correlationId } },
      ),
    );
  }

  async cancelServiceOrder(payload: { id: string; reason: string; correlationId: string }): Promise<void> {
    await firstValueFrom(
      this.http.post(
        `${this.baseUrl}/service-orders/${payload.id}/cancel`,
        { reason: payload.reason },
        { headers: { 'x-correlation-id': payload.correlationId } },
      ),
    );
  }
}
