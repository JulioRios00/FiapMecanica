/**
 * Node's AggregateError (e.g. from a DNS/connect failure with multiple
 * addresses) can have an empty top-level `.message` while the real reason
 * lives in `.errors`. Falling back to that keeps SagaInstance.lastError
 * (and logs) useful for debugging instead of an empty string.
 */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message) {
      return error.message;
    }
    const aggregate = error as { errors?: unknown[] };
    if (Array.isArray(aggregate.errors) && aggregate.errors.length > 0) {
      return aggregate.errors.map((inner) => errorMessage(inner)).join('; ');
    }
    return error.name || 'Unknown error';
  }
  return String(error);
}
