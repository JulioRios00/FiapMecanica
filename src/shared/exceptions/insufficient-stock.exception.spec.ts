import { InsufficientStockException } from './insufficient-stock.exception';

describe('InsufficientStockException', () => {
  it('should create an instance with formatted message', () => {
    const exception = new InsufficientStockException('Brake Pad', 10, 5);

    expect(exception).toBeInstanceOf(Error);
    expect(exception.message).toBe(
      'Insufficient stock for part "Brake Pad". Requested: 10, Available: 5',
    );
    expect(exception.name).toBe('InsufficientStockException');
  });

  it('should be throwable', () => {
    const exception = new InsufficientStockException('Oil Filter', 3, 0);

    expect(() => {
      throw exception;
    }).toThrow(InsufficientStockException);
  });

  it('should include part details in message', () => {
    const exception = new InsufficientStockException('Spark Plug', 8, 2);

    expect(exception.message).toContain('Spark Plug');
    expect(exception.message).toContain('8');
    expect(exception.message).toContain('2');
  });
});
