export abstract class BillingServicePort {
  abstract requestQuote(payload: {
    osId: string;
    description: string;
    correlationId: string;
  }): Promise<{ budgetId: string }>;
  abstract confirmPayment(payload: { budgetId: string; correlationId: string }): Promise<void>;
  abstract cancelQuote(payload: { budgetId: string; reason: string; correlationId: string }): Promise<void>;
  abstract notifyExecutionFailure(payload: {
    budgetId: string;
    reason: string;
    correlationId: string;
  }): Promise<void>;
}
