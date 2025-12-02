export class LicensePlate {
  private readonly value: string;

  constructor(value: string) {
    this.value = this.sanitize(value);
    this.validate();
  }

  private sanitize(value: string): string {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  private validate(): void {
    // Brazilian license plate formats:
    // Old format: ABC1234 (3 letters + 4 numbers)
    // Mercosul format: ABC1D23 (3 letters + 1 number + 1 letter + 2 numbers)
    const oldFormat = /^[A-Z]{3}[0-9]{4}$/;
    const mercosulFormat = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

    if (!oldFormat.test(this.value) && !mercosulFormat.test(this.value)) {
      throw new Error(
        'Invalid license plate format. Must be ABC1234 or ABC1D23',
      );
    }
  }

  public getValue(): string {
    return this.value;
  }

  public getFormatted(): string {
    if (this.value.length === 7) {
      // ABC1D23 or ABC1234
      return `${this.value.substring(0, 3)}-${this.value.substring(3)}`;
    }
    return this.value;
  }
}

