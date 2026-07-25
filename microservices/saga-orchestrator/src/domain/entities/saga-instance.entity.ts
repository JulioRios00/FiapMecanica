export type SagaStep = 'OPEN_OS' | 'REQUEST_QUOTE' | 'CONFIRM_PAYMENT' | 'START_EXECUTION';

export type SagaStatus =
  | 'STARTED'
  | 'AWAITING_QUOTE_APPROVAL'
  | 'PAYMENT_CONFIRMED'
  | 'EXECUTION_STARTED'
  | 'COMPLETED'
  | 'COMPENSATING'
  | 'COMPENSATED'
  | 'FAILED';

export interface SagaInstanceProps {
  id: string;
  osId?: string;
  status: SagaStatus;
  correlationId: string;
  completedSteps?: SagaStep[];
  createdAt: Date;
  updatedAt: Date;
  lastError?: string;
}

export class SagaInstance {
  private readonly props: SagaInstanceProps;

  constructor(props: SagaInstanceProps) {
    this.props = { ...props, completedSteps: [...(props.completedSteps ?? [])] };
  }

  setOsId(osId: string): void {
    this.props.osId = osId;
    this.props.updatedAt = new Date();
  }

  markStepCompleted(step: SagaStep): void {
    this.props.completedSteps = [...(this.props.completedSteps ?? []), step];
    this.props.updatedAt = new Date();
  }

  setAwaitingApproval(): void {
    this.props.status = 'AWAITING_QUOTE_APPROVAL';
    this.props.updatedAt = new Date();
  }

  setPaymentConfirmed(): void {
    this.props.status = 'PAYMENT_CONFIRMED';
    this.props.updatedAt = new Date();
  }

  setExecutionStarted(): void {
    this.props.status = 'EXECUTION_STARTED';
    this.props.updatedAt = new Date();
  }

  complete(): void {
    this.props.status = 'COMPLETED';
    this.props.updatedAt = new Date();
  }

  startCompensating(errorMessage: string): void {
    this.props.status = 'COMPENSATING';
    this.props.lastError = errorMessage;
    this.props.updatedAt = new Date();
  }

  compensate(errorMessage: string): void {
    this.props.status = 'COMPENSATED';
    this.props.lastError = errorMessage;
    this.props.updatedAt = new Date();
  }

  fail(errorMessage: string): void {
    this.props.status = 'FAILED';
    this.props.lastError = errorMessage;
    this.props.updatedAt = new Date();
  }

  toJSON() {
    return { ...this.props, completedSteps: [...(this.props.completedSteps ?? [])] };
  }

  getId(): string {
    return this.props.id;
  }

  getOsId(): string | undefined {
    return this.props.osId;
  }

  getStatus(): SagaStatus {
    return this.props.status;
  }

  getCorrelationId(): string {
    return this.props.correlationId;
  }

  getCompletedSteps(): SagaStep[] {
    return [...(this.props.completedSteps ?? [])];
  }

  getLastError(): string | undefined {
    return this.props.lastError;
  }
}
