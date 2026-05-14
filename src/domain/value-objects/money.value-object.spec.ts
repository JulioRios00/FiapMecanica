import { Money } from './money.value-object';

describe('Money', () => {
  describe('Creation and validation', () => {
    it('should create a valid Money instance', () => {
      expect(() => new Money(100.5)).not.toThrow();
      expect(() => new Money(0)).not.toThrow();
      expect(() => new Money(0.01)).not.toThrow();
    });

    it('should reject negative amounts', () => {
      expect(() => new Money(-1)).toThrow('Money amount cannot be negative');
      expect(() => new Money(-100.5)).toThrow('Money amount cannot be negative');
    });

    it('should reject non-finite numbers', () => {
      expect(() => new Money(Infinity)).toThrow('Money amount must be a finite number');
      expect(() => new Money(-Infinity)).toThrow('Money amount must be a finite number');
      expect(() => new Money(NaN)).toThrow('Money amount must be a finite number');
    });

    it('should round to 2 decimal places', () => {
      const money = new Money(100.999);
      expect(money.toNumber()).toBe(101.0);

      const money2 = new Money(100.994);
      expect(money2.toNumber()).toBe(100.99);

      const money3 = new Money(100.123456);
      expect(money3.toNumber()).toBe(100.12);
    });

    it('should create zero money', () => {
      const zero = Money.zero();
      expect(zero.toNumber()).toBe(0);
    });

    it('should create money from number', () => {
      const money = Money.fromNumber(50.75);
      expect(money.toNumber()).toBe(50.75);
    });
  });

  describe('Arithmetic operations', () => {
    it('should add two money values', () => {
      const money1 = new Money(100);
      const money2 = new Money(50);
      const result = money1.add(money2);

      expect(result.toNumber()).toBe(150);
    });

    it('should add decimal values correctly', () => {
      const money1 = new Money(100.5);
      const money2 = new Money(50.75);
      const result = money1.add(money2);

      expect(result.toNumber()).toBe(151.25);
    });

    it('should subtract two money values', () => {
      const money1 = new Money(100);
      const money2 = new Money(50);
      const result = money1.subtract(money2);

      expect(result.toNumber()).toBe(50);
    });

    it('should throw error when subtraction results in negative', () => {
      const money1 = new Money(50);
      const money2 = new Money(100);

      expect(() => money1.subtract(money2)).toThrow('Subtraction would result in negative amount');
    });

    it('should multiply money by a positive number', () => {
      const money = new Money(100);
      const result = money.multiply(2);

      expect(result.toNumber()).toBe(200);
    });

    it('should multiply money by decimal', () => {
      const money = new Money(100);
      const result = money.multiply(1.5);

      expect(result.toNumber()).toBe(150);
    });

    it('should throw error when multiplying by negative number', () => {
      const money = new Money(100);

      expect(() => money.multiply(-2)).toThrow('Multiplier cannot be negative');
    });

    it('should allow multiplication by zero', () => {
      const money = new Money(100);
      const result = money.multiply(0);

      expect(result.toNumber()).toBe(0);
    });
  });

  describe('Comparison operations', () => {
    it('should compare equality correctly', () => {
      const money1 = new Money(100);
      const money2 = new Money(100);
      const money3 = new Money(50);

      expect(money1.equals(money2)).toBe(true);
      expect(money1.equals(money3)).toBe(false);
    });

    it('should compare greater than correctly', () => {
      const money1 = new Money(100);
      const money2 = new Money(50);

      expect(money1.greaterThan(money2)).toBe(true);
      expect(money2.greaterThan(money1)).toBe(false);
      expect(money1.greaterThan(money1)).toBe(false);
    });

    it('should compare greater than or equal correctly', () => {
      const money1 = new Money(100);
      const money2 = new Money(50);
      const money3 = new Money(100);

      expect(money1.greaterThanOrEqual(money2)).toBe(true);
      expect(money1.greaterThanOrEqual(money3)).toBe(true);
      expect(money2.greaterThanOrEqual(money1)).toBe(false);
    });

    it('should compare less than correctly', () => {
      const money1 = new Money(50);
      const money2 = new Money(100);

      expect(money1.lessThan(money2)).toBe(true);
      expect(money2.lessThan(money1)).toBe(false);
      expect(money1.lessThan(money1)).toBe(false);
    });

    it('should compare less than or equal correctly', () => {
      const money1 = new Money(50);
      const money2 = new Money(100);
      const money3 = new Money(50);

      expect(money1.lessThanOrEqual(money2)).toBe(true);
      expect(money1.lessThanOrEqual(money3)).toBe(true);
      expect(money2.lessThanOrEqual(money1)).toBe(false);
    });
  });

  describe('Immutability', () => {
    it('should not modify original money on add', () => {
      const original = new Money(100);
      const toAdd = new Money(50);
      const result = original.add(toAdd);

      expect(original.toNumber()).toBe(100);
      expect(toAdd.toNumber()).toBe(50);
      expect(result.toNumber()).toBe(150);
    });

    it('should not modify original money on subtract', () => {
      const original = new Money(100);
      const toSubtract = new Money(50);
      const result = original.subtract(toSubtract);

      expect(original.toNumber()).toBe(100);
      expect(toSubtract.toNumber()).toBe(50);
      expect(result.toNumber()).toBe(50);
    });

    it('should not modify original money on multiply', () => {
      const original = new Money(100);
      const result = original.multiply(2);

      expect(original.toNumber()).toBe(100);
      expect(result.toNumber()).toBe(200);
    });
  });

  describe('Conversion and formatting', () => {
    it('should convert to number', () => {
      const money = new Money(100.5);
      expect(money.toNumber()).toBe(100.5);
    });

    it('should get currency', () => {
      const money = new Money(100);
      expect(money.getCurrency()).toBe('BRL');
    });

    it('should format to string', () => {
      const money = new Money(100.5);
      expect(money.toString()).toBe('BRL 100.50');

      const money2 = new Money(1234.99);
      expect(money2.toString()).toBe('BRL 1234.99');
    });
  });

  describe('Edge cases', () => {
    it('should handle very small amounts', () => {
      const money = new Money(0.01);
      expect(money.toNumber()).toBe(0.01);
    });

    it('should handle large amounts', () => {
      const money = new Money(999999.99);
      expect(money.toNumber()).toBe(999999.99);
    });

    it('should handle floating point precision issues', () => {
      const money1 = new Money(0.1);
      const money2 = new Money(0.2);
      const result = money1.add(money2);

      expect(result.toNumber()).toBe(0.3); // Not 0.30000000000000004
    });

    it('should maintain consistency across multiple operations', () => {
      const money = new Money(100);
      const result = money.add(new Money(50)).subtract(new Money(30)).multiply(2);

      expect(result.toNumber()).toBe(240);
    });
  });
});
