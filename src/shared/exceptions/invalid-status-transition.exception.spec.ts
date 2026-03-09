import { InvalidStatusTransitionException } from './invalid-status-transition.exception';

describe('InvalidStatusTransitionException', () => {
  it('should create an instance with formatted message', () => {
    const exception = new InvalidStatusTransitionException('COMPLETED', 'IN_PROGRESS');

    expect(exception).toBeInstanceOf(Error);
    expect(exception.message).toBe('Invalid status transition from "COMPLETED" to "IN_PROGRESS"');
    expect(exception.name).toBe('InvalidStatusTransitionException');
  });

  it('should be throwable', () => {
    const exception = new InvalidStatusTransitionException('CANCELLED', 'APPROVED');

    expect(() => {
      throw exception;
    }).toThrow(InvalidStatusTransitionException);
  });

  it('should include both statuses in message', () => {
    const exception = new InvalidStatusTransitionException('DELIVERED', 'RECEIVED');

    expect(exception.message).toContain('DELIVERED');
    expect(exception.message).toContain('RECEIVED');
  });
});
