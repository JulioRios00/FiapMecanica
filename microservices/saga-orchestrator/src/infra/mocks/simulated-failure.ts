/**
 * Billing/Execution are teammate-owned services not built in this repo.
 * Mocks let the saga be exercised end-to-end without them running. A
 * correlationId of "fail:<STEP>" (e.g. "fail:REQUEST_QUOTE") deliberately
 * throws from the matching mock call, so the compensation path can be
 * demonstrated/tested through the real HTTP API.
 */
export function simulateFailureIfRequested(step: string, correlationId: string): void {
  if (correlationId === `fail:${step}`) {
    throw new Error(`Simulated downstream failure at step ${step} (requested via correlationId)`);
  }
}
