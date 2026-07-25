import { Injectable, Logger } from '@nestjs/common';
import { ExecutionServicePort } from '../../application/ports/execution-service.port';
import { simulateFailureIfRequested } from './simulated-failure';

@Injectable()
export class MockExecutionServiceClient implements ExecutionServicePort {
  private readonly logger = new Logger(MockExecutionServiceClient.name);

  async startExecution(payload: { osId: string; correlationId: string }): Promise<void> {
    simulateFailureIfRequested('START_EXECUTION', payload.correlationId);
    this.logger.log(`[mock] execution started for OS ${payload.osId}`);
  }

  async cancelExecution(payload: { osId: string; reason: string; correlationId: string }): Promise<void> {
    this.logger.log(`[mock] execution cancelled for OS ${payload.osId} (${payload.reason})`);
  }
}
