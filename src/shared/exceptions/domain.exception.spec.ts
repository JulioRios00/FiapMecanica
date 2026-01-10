import { DomainException } from './domain.exception';

describe('DomainException', () => {
  it('should create an instance with message', () => {
    const message = 'Test error message';
    const exception = new DomainException(message);

    expect(exception).toBeInstanceOf(Error);
    expect(exception.message).toBe(message);
    expect(exception.name).toBe('DomainException');
  });

  it('should be throwable', () => {
    const message = 'Test error message';
    const exception = new DomainException(message);

    expect(() => {
      throw exception;
    }).toThrow(new DomainException(message));
  });
});
