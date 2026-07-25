export abstract class OsServicePort {
  abstract openServiceOrder(payload: { description: string; correlationId: string }): Promise<{ id: string }>;
  abstract updateStatus(payload: {
    id: string;
    status: string;
    reason?: string;
    correlationId: string;
  }): Promise<void>;
  abstract cancelServiceOrder(payload: {
    id: string;
    reason: string;
    correlationId: string;
  }): Promise<void>;
}

