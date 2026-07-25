import { SagaInstance } from './saga-instance.entity';

function buildSaga() {
  return new SagaInstance({
    id: 'saga-1',
    status: 'STARTED',
    correlationId: 'corr-1',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  });
}

describe('SagaInstance', () => {
  it('starts with no osId and no completed steps', () => {
    const saga = buildSaga();

    expect(saga.getOsId()).toBeUndefined();
    expect(saga.getCompletedSteps()).toEqual([]);
    expect(saga.getStatus()).toBe('STARTED');
  });

  it('tracks the osId, budgetId, and completed steps as the saga advances', () => {
    const saga = buildSaga();

    saga.setOsId('os-1');
    saga.markStepCompleted('OPEN_OS');
    saga.setBudgetId('budget-1');
    saga.markStepCompleted('REQUEST_QUOTE');
    saga.setAwaitingApproval();

    expect(saga.getOsId()).toBe('os-1');
    expect(saga.getBudgetId()).toBe('budget-1');
    expect(saga.getCompletedSteps()).toEqual(['OPEN_OS', 'REQUEST_QUOTE']);
    expect(saga.getStatus()).toBe('AWAITING_QUOTE_APPROVAL');
  });

  it('does not mutate a previously returned completedSteps snapshot', () => {
    const saga = buildSaga();
    saga.markStepCompleted('OPEN_OS');

    const snapshot = saga.getCompletedSteps();
    saga.markStepCompleted('REQUEST_QUOTE');

    expect(snapshot).toEqual(['OPEN_OS']);
    expect(saga.getCompletedSteps()).toEqual(['OPEN_OS', 'REQUEST_QUOTE']);
  });

  it('moves through payment confirmed, execution started, and completed', () => {
    const saga = buildSaga();

    saga.setPaymentConfirmed();
    expect(saga.getStatus()).toBe('PAYMENT_CONFIRMED');

    saga.setExecutionStarted();
    expect(saga.getStatus()).toBe('EXECUTION_STARTED');

    saga.complete();
    expect(saga.getStatus()).toBe('COMPLETED');
  });

  it('records a failure with no compensation when nothing has completed yet', () => {
    const saga = buildSaga();

    saga.fail('os-service unavailable');

    expect(saga.getStatus()).toBe('FAILED');
    expect(saga.getLastError()).toBe('os-service unavailable');
  });

  it('transitions through COMPENSATING before landing on COMPENSATED', () => {
    const saga = buildSaga();
    saga.setOsId('os-1');
    saga.markStepCompleted('OPEN_OS');

    saga.startCompensating('billing quote rejected');
    expect(saga.getStatus()).toBe('COMPENSATING');
    expect(saga.getLastError()).toBe('billing quote rejected');

    saga.compensate('billing quote rejected');
    expect(saga.getStatus()).toBe('COMPENSATED');
  });

  it('serializes a defensive copy via toJSON', () => {
    const saga = buildSaga();
    saga.setOsId('os-1');
    saga.markStepCompleted('OPEN_OS');

    const json = saga.toJSON();
    json.completedSteps.push('REQUEST_QUOTE');

    expect(saga.getCompletedSteps()).toEqual(['OPEN_OS']);
  });
});
