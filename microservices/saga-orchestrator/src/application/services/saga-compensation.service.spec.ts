import { SagaInstance } from '../../domain/entities/saga-instance.entity';
import { OsServicePort } from '../ports/os-service.port';
import { BillingServicePort } from '../ports/billing-service.port';
import { ExecutionServicePort } from '../ports/execution-service.port';
import { SagaCompensationService } from './saga-compensation.service';

function buildSaga(): SagaInstance {
  const now = new Date();
  return new SagaInstance({
    id: 'saga-1',
    status: 'COMPENSATING',
    correlationId: 'corr-1',
    createdAt: now,
    updatedAt: now,
  });
}

describe('SagaCompensationService', () => {
  let osService: jest.Mocked<OsServicePort>;
  let billingService: jest.Mocked<BillingServicePort>;
  let executionService: jest.Mocked<ExecutionServicePort>;
  let service: SagaCompensationService;

  beforeEach(() => {
    osService = {
      openServiceOrder: jest.fn(),
      updateStatus: jest.fn(),
      cancelServiceOrder: jest.fn().mockResolvedValue(undefined),
    };
    billingService = {
      requestQuote: jest.fn(),
      confirmPayment: jest.fn(),
      cancelQuote: jest.fn().mockResolvedValue(undefined),
      notifyExecutionFailure: jest.fn().mockResolvedValue(undefined),
    };
    executionService = {
      startExecution: jest.fn(),
      cancelExecution: jest.fn().mockResolvedValue(undefined),
    };
    service = new SagaCompensationService(osService, billingService, executionService);
  });

  it('does nothing when the OS was never opened', async () => {
    const saga = buildSaga();

    await service.compensate(saga, 'boom', 'corr-1');

    expect(osService.cancelServiceOrder).not.toHaveBeenCalled();
    expect(billingService.cancelQuote).not.toHaveBeenCalled();
    expect(executionService.cancelExecution).not.toHaveBeenCalled();
  });

  it('cancels only the service order when quote was never requested', async () => {
    const saga = buildSaga();
    saga.setOsId('os-1');
    saga.markStepCompleted('OPEN_OS');

    await service.compensate(saga, 'billing unreachable', 'corr-1');

    expect(osService.cancelServiceOrder).toHaveBeenCalledWith({
      id: 'os-1',
      reason: 'billing unreachable',
      correlationId: 'corr-1',
    });
    expect(billingService.cancelQuote).not.toHaveBeenCalled();
    expect(billingService.notifyExecutionFailure).not.toHaveBeenCalled();
    expect(executionService.cancelExecution).not.toHaveBeenCalled();
  });

  it('cancels the pending quote and the service order when payment was never confirmed', async () => {
    const saga = buildSaga();
    saga.setOsId('os-1');
    saga.markStepCompleted('OPEN_OS');
    saga.setBudgetId('budget-1');
    saga.markStepCompleted('REQUEST_QUOTE');

    await service.compensate(saga, 'payment declined', 'corr-1');

    expect(billingService.cancelQuote).toHaveBeenCalledWith({
      budgetId: 'budget-1',
      reason: 'payment declined',
      correlationId: 'corr-1',
    });
    expect(billingService.notifyExecutionFailure).not.toHaveBeenCalled();
    expect(osService.cancelServiceOrder).toHaveBeenCalledWith({
      id: 'os-1',
      reason: 'payment declined',
      correlationId: 'corr-1',
    });
  });

  it('notifies billing of the failure (refund path) instead of cancelling the quote once payment was confirmed', async () => {
    const saga = buildSaga();
    saga.setOsId('os-1');
    saga.markStepCompleted('OPEN_OS');
    saga.setBudgetId('budget-1');
    saga.markStepCompleted('REQUEST_QUOTE');
    saga.markStepCompleted('CONFIRM_PAYMENT');

    await service.compensate(saga, 'execution rejected', 'corr-1');

    expect(billingService.notifyExecutionFailure).toHaveBeenCalledWith({
      budgetId: 'budget-1',
      reason: 'execution rejected',
      correlationId: 'corr-1',
    });
    expect(billingService.cancelQuote).not.toHaveBeenCalled();
    expect(osService.cancelServiceOrder).toHaveBeenCalled();
  });

  it('cancels the execution too once it had started, still cancelling the service order', async () => {
    const saga = buildSaga();
    saga.setOsId('os-1');
    saga.markStepCompleted('OPEN_OS');
    saga.setBudgetId('budget-1');
    saga.markStepCompleted('REQUEST_QUOTE');
    saga.markStepCompleted('CONFIRM_PAYMENT');
    saga.markStepCompleted('START_EXECUTION');

    await service.compensate(saga, 'final OS update failed', 'corr-1');

    expect(executionService.cancelExecution).toHaveBeenCalledWith({
      osId: 'os-1',
      reason: 'final OS update failed',
      correlationId: 'corr-1',
    });
    expect(billingService.notifyExecutionFailure).toHaveBeenCalled();
    expect(osService.cancelServiceOrder).toHaveBeenCalled();
  });

  it('keeps running remaining compensations even if one of them throws', async () => {
    const saga = buildSaga();
    saga.setOsId('os-1');
    saga.markStepCompleted('OPEN_OS');
    saga.setBudgetId('budget-1');
    saga.markStepCompleted('REQUEST_QUOTE');
    billingService.cancelQuote.mockRejectedValue(new Error('billing down'));

    await service.compensate(saga, 'boom', 'corr-1');

    expect(billingService.cancelQuote).toHaveBeenCalled();
    expect(osService.cancelServiceOrder).toHaveBeenCalled();
  });
});
