export abstract class ExecutionServicePort {
  abstract startExecution(payload: { osId: string; correlationId: string }): Promise<void>;
  abstract cancelExecution(payload: { osId: string; reason: string; correlationId: string }): Promise<void>;
}

