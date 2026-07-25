import { SagaRepositoryPort } from '../ports/saga-repository.port';
import { OsServicePort } from '../ports/os-service.port';
import { BillingServicePort } from '../ports/billing-service.port';
import { ExecutionServicePort } from '../ports/execution-service.port';
import { SagaCompensationService } from '../services/saga-compensation.service';
import { StartServiceOrderSagaUseCase } from './start-service-order-saga.use-case';

describe('StartServiceOrderSagaUseCase', () => {
  let sagaRepository: jest.Mocked<SagaRepositoryPort>;
  let osService: jest.Mocked<OsServicePort>;
  let billingService: jest.Mocked<BillingServicePort>;
  let executionService: jest.Mocked<ExecutionServicePort>;
  let compensationService: jest.Mocked<SagaCompensationService>;
  let useCase: StartServiceOrderSagaUseCase;

  beforeEach(() => {
    sagaRepository = {
      create: jest.fn().mockImplementation((saga) => Promise.resolve(saga)),
      save: jest.fn().mockImplementation((saga) => Promise.resolve(saga)),
      findById: jest.fn(),
    };
    osService = {
      openServiceOrder: jest.fn().mockResolvedValue({ id: 'os-1' }),
      updateStatus: jest.fn().mockResolvedValue(undefined),
      cancelServiceOrder: jest.fn().mockResolvedValue(undefined),
    };
    billingService = {
      requestQuote: jest.fn().mockResolvedValue(undefined),
      confirmPayment: jest.fn().mockResolvedValue(undefined),
      cancelQuote: jest.fn().mockResolvedValue(undefined),
      notifyExecutionFailure: jest.fn().mockResolvedValue(undefined),
    };
    executionService = {
      startExecution: jest.fn().mockResolvedValue(undefined),
      cancelExecution: jest.fn().mockResolvedValue(undefined),
    };
    compensationService = {
      compensate: jest.fn(async () => undefined),
    } as unknown as jest.Mocked<SagaCompensationService>;

    useCase = new StartServiceOrderSagaUseCase(
      sagaRepository,
      osService,
      billingService,
      executionService,
      compensationService,
    );
  });

  it('drives the full OS -> Quote -> Execution flow to completion', async () => {
    const saga = await useCase.execute({ description: 'Replace brake pads', correlationId: 'corr-1' });

    expect(osService.openServiceOrder).toHaveBeenCalledWith({
      description: 'Replace brake pads',
      correlationId: 'corr-1',
    });
    expect(billingService.requestQuote).toHaveBeenCalledWith({ osId: 'os-1', correlationId: 'corr-1' });
    expect(billingService.confirmPayment).toHaveBeenCalledWith({ osId: 'os-1', correlationId: 'corr-1' });
    expect(executionService.startExecution).toHaveBeenCalledWith({ osId: 'os-1', correlationId: 'corr-1' });
    expect(osService.updateStatus).toHaveBeenCalledWith({
      id: 'os-1',
      status: 'COMPLETED',
      correlationId: 'corr-1',
    });
    expect(compensationService.compensate).not.toHaveBeenCalled();
    expect(saga.getStatus()).toBe('COMPLETED');
    expect(saga.getCompletedSteps()).toEqual([
      'OPEN_OS',
      'REQUEST_QUOTE',
      'CONFIRM_PAYMENT',
      'START_EXECUTION',
    ]);
  });

  it('generates a correlationId when none is provided', async () => {
    await useCase.execute({ description: 'Replace brake pads' });

    const call = osService.openServiceOrder.mock.calls[0][0];
    expect(call.correlationId).toEqual(expect.any(String));
    expect(call.correlationId.length).toBeGreaterThan(0);
  });

  it('fails without compensating when the OS was never opened', async () => {
    osService.openServiceOrder.mockRejectedValue(new Error('os-service unreachable'));

    const saga = await useCase.execute({ description: 'Replace brake pads', correlationId: 'corr-1' });

    expect(compensationService.compensate).not.toHaveBeenCalled();
    expect(saga.getStatus()).toBe('FAILED');
    expect(saga.getLastError()).toBe('os-service unreachable');
  });

  it('compensates and marks the saga COMPENSATED when a downstream step fails after OS was opened', async () => {
    billingService.requestQuote.mockRejectedValue(new Error('billing down'));

    const saga = await useCase.execute({ description: 'Replace brake pads', correlationId: 'corr-1' });

    expect(compensationService.compensate).toHaveBeenCalledWith(
      expect.objectContaining({ getOsId: expect.any(Function) }),
      'billing down',
      'corr-1',
    );
    expect(saga.getStatus()).toBe('COMPENSATED');
    expect(saga.getLastError()).toBe('billing down');
    expect(saga.getCompletedSteps()).toEqual(['OPEN_OS']);
  });

  it('compensates when execution fails to start after payment was confirmed', async () => {
    executionService.startExecution.mockRejectedValue(new Error('execution service rejected request'));

    const saga = await useCase.execute({ description: 'Replace brake pads', correlationId: 'corr-1' });

    expect(compensationService.compensate).toHaveBeenCalled();
    expect(saga.getStatus()).toBe('COMPENSATED');
    expect(saga.getCompletedSteps()).toEqual(['OPEN_OS', 'REQUEST_QUOTE', 'CONFIRM_PAYMENT']);
  });
});
