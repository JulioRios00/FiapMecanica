export class Money {
  private readonly amount: number;
  private readonly currency: string = 'BRL';

  constructor(amount: number) {
    this.amount = this.round(amount);
    this.validate();
  }

  private round(value: number): number {
    // Round to 2 decimal places to avoid floating point precision issues
    return Math.round(value * 100) / 100;
  }

  private validate(): void {
    if (!Number.isFinite(this.amount)) {
      throw new Error('Money amount must be a finite number');
    }

    if (this.amount < 0) {
      throw new Error('Money amount cannot be negative');
    }
  }

  public add(other: Money): Money {
    return new Money(this.amount + other.amount);
  }

  public subtract(other: Money): Money {
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new Error('Subtraction would result in negative amount');
    }
    return new Money(result);
  }

  public multiply(multiplier: number): Money {
    if (multiplier < 0) {
      throw new Error('Multiplier cannot be negative');
    }
    return new Money(this.amount * multiplier);
  }

  public equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  public greaterThan(other: Money): boolean {
    return this.amount > other.amount;
  }

  public greaterThanOrEqual(other: Money): boolean {
    return this.amount >= other.amount;
  }

  public lessThan(other: Money): boolean {
    return this.amount < other.amount;
  }

  public lessThanOrEqual(other: Money): boolean {
    return this.amount <= other.amount;
  }

  public toNumber(): number {
    return this.amount;
  }

  public getCurrency(): string {
    return this.currency;
  }

  public toString(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }

  public static zero(): Money {
    return new Money(0);
  }

  public static fromNumber(amount: number): Money {
    return new Money(amount);
  }
}
