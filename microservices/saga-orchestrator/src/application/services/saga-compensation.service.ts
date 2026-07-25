import { Injectable, Logger } from '@nestjs/common';
import { SagaInstance } from '../../domain/entities/saga-instance.entity';
import { OsServicePort } from '../ports/os-service.port';
import { BillingServicePort } from '../ports/billing-service.port';
import { ExecutionServicePort } from '../ports/execution-service.port';
import { errorMessage } from '../shared/error-message';

/**
 * Runs the compensating (rollback) actions for a saga that failed partway
 * through the OS -> Quote -> Execution flow. Compensations run in reverse
 * step order and are best-effort: one failing compensation is logged but does
 * not stop the remaining ones, since partial rollback is still better than none.
 */
@Injectable()
export class SagaCompensationService {
  private readonly logger = new Logger(SagaCompensationService.name);

  constructor(
    private readonly osService: OsServicePort,
    private readonly billingService: BillingServicePort,
    private readonly executionService: ExecutionServicePort,
  ) {}

  async compensate(saga: SagaInstance, reason: string, correlationId: string): Promise<void> {
    const osId = saga.getOsId();
    if (!osId) {
      return;
    }

    const budgetId = saga.getBudgetId();
    const steps = new Set(saga.getCompletedSteps());

    if (steps.has('START_EXECUTION')) {
      await this.run(saga, 'cancelExecution', () =>
        this.executionService.cancelExecution({ osId, reason, correlationId }),
      );
    }

    if (budgetId && steps.has('CONFIRM_PAYMENT')) {
      await this.run(saga, 'notifyExecutionFailure', () =>
        this.billingService.notifyExecutionFailure({ budgetId, reason, correlationId }),
      );
    } else if (budgetId && steps.has('REQUEST_QUOTE')) {
      await this.run(saga, 'cancelQuote', () =>
        this.billingService.cancelQuote({ budgetId, reason, correlationId }),
      );
    }

    await this.run(saga, 'cancelServiceOrder', () =>
      this.osService.cancelServiceOrder({ id: osId, reason, correlationId }),
    );
  }

  private async run(saga: SagaInstance, label: string, action: () => Promise<void>): Promise<void> {
    try {
      await action();
    } catch (error) {
      this.logger.error(`Compensation step "${label}" failed for saga ${saga.getId()}: ${errorMessage(error)}`);
    }
  }
}
