export interface DomainEvent<TPayload = unknown> {
  eventId: string;
  eventType: string;
  version: string;
  occurredAt: string;
  aggregateId: string;
  correlationId?: string;
  payload: TPayload;
}

