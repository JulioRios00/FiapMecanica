export class Email {
  private readonly value: string;

  constructor(value: string) {
    this.value = value.toLowerCase().trim();
    this.validate();
  }

  private validate(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.value)) {
      throw new Error('Invalid email format');
    }
  }

  public getValue(): string {
    return this.value;
  }
}

