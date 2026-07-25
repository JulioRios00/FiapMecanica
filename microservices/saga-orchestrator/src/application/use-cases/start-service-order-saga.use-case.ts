import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SagaInstance } from '../../domain/entities/saga-instance.entity';
import { SagaRepositoryPort } from '../ports/saga-repository.port';
import { OsServicePort } from '../ports/os-service.port';
import { BillingServicePort } from '../ports/billing-service.port';
import { ExecutionServicePort } from '../ports/execution-service.port';
import { SagaCompensationService } from '../services/saga-compensation.service';
import { errorMessage } from '../shared/error-message';

interface Input {
  description: string;
  correlationId?: string;
}

/**
 * Orchestrated Saga: this use-case is the single coordinator that drives every
 * step of the OS -> Quote -> Execution flow and decides, on failure, whether
 * and how to compensate. Each participant (os-service, billing, execution)
 * only exposes commands/compensations; none of them know about each other or
 * about the saga itself.
 */
@Injectable()
export class StartServiceOrderSagaUseCase {
  private readonly logger = new Logger(StartServiceOrderSagaUseCase.name);

  constructor(
    private readonly sagaRepository: SagaRepositoryPort,
    private readonly osService: OsServicePort,
    private readonly billingService: BillingServicePort,
    private readonly executionService: ExecutionServicePort,
    private readonly compensationService: SagaCompensationService,
  ) {}

  async execute(input: Input): Promise<SagaInstance> {
    const correlationId = input.correlationId ?? randomUUID();
    const now = new Date();

    let saga = new SagaInstance({
      id: randomUUID(),
      status: 'STARTED',
      correlationId,
      createdAt: now,
      updatedAt: now,
    });
    saga = await this.sagaRepository.create(saga);

    try {
      const { id: osId } = await this.osService.openServiceOrder({
        description: input.description,
        correlationId,
      });
      saga.setOsId(osId);
      saga.markStepCompleted('OPEN_OS');
      saga = await this.sagaRepository.save(saga);

      const { budgetId } = await this.billingService.requestQuote({
        osId,
        description: input.description,
        correlationId,
      });
      saga.setBudgetId(budgetId);
      saga.markStepCompleted('REQUEST_QUOTE');
      saga.setAwaitingApproval();
      saga = await this.sagaRepository.save(saga);

      await this.billingService.confirmPayment({ budgetId, correlationId });
      saga.markStepCompleted('CONFIRM_PAYMENT');
      saga.setPaymentConfirmed();
      saga = await this.sagaRepository.save(saga);

      await this.executionService.startExecution({ osId, correlationId });
      saga.markStepCompleted('START_EXECUTION');
      saga.setExecutionStarted();
      saga = await this.sagaRepository.save(saga);

      await this.osService.updateStatus({ id: osId, status: 'COMPLETED', correlationId });
      saga.complete();
      return await this.sagaRepository.save(saga);
    } catch (error) {
      const reason = errorMessage(error);
      this.logger.error(`Saga ${saga.getId()} failed: ${reason}`);

      if (saga.getOsId()) {
        saga.startCompensating(reason);
        saga = await this.sagaRepository.save(saga);

        await this.compensationService.compensate(saga, reason, correlationId);
        saga.compensate(reason);
      } else {
        saga.fail(reason);
      }

      return await this.sagaRepository.save(saga);
    }
  }
}
