export abstract class BillingServicePort {
  abstract requestQuote(payload: { osId: string; correlationId: string }): Promise<void>;
  abstract confirmPayment(payload: { osId: string; correlationId: string }): Promise<void>;
  abstract cancelQuote(payload: { osId: string; reason: string; correlationId: string }): Promise<void>;
  abstract notifyExecutionFailure(payload: {
    osId: string;
    reason: string;
    correlationId: string;
  }): Promise<void>;
}

