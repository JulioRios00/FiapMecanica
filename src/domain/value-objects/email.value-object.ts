export class Email {
  private readonly value: string;

  constructor(value: string) {
    this.value = value.toLowerCase().trim();
    this.validate();
  }

  private validate(): void {
    // More comprehensive email validation that allows +, -, _ in local part
    const emailRegex = /^[a-zA-Z0-9][a-zA-Z0-9._+-]*[a-zA-Z0-9]@[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    
    // Additional checks for common invalid patterns
    if (
      !emailRegex.test(this.value) ||
      this.value.includes('..') ||
      this.value.includes('@@') ||
      this.value.startsWith('.') ||
      this.value.includes('@.')
    ) {
      throw new Error('Invalid email format');
    }
  }

  public getValue(): string {
    return this.value;
  }
}

