import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ExecutionServicePort } from '../../application/ports/execution-service.port';

/**
 * Contract-compliant HTTP client for the Execution Service. Owned by a different
 * team; point EXECUTION_SERVICE_URL at their deployment once it exists. Until
 * then, saga-orchestrator defaults to MockExecutionServiceClient (see infra/mocks).
 */
@Injectable()
export class HttpExecutionServiceClient implements ExecutionServicePort {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('EXECUTION_SERVICE_URL', 'http://localhost:3040/api/v1');
  }

  async startExecution(payload: { osId: string; correlationId: string }): Promise<void> {
    await firstValueFrom(
      this.http.post(
        `${this.baseUrl}/executions`,
        { osId: payload.osId },
        { headers: { 'x-correlation-id': payload.correlationId } },
      ),
    );
  }

  async cancelExecution(payload: { osId: string; reason: string; correlationId: string }): Promise<void> {
    await firstValueFrom(
      this.http.post(
        `${this.baseUrl}/executions/${payload.osId}/cancel`,
        { reason: payload.reason },
        { headers: { 'x-correlation-id': payload.correlationId } },
      ),
    );
  }
}
