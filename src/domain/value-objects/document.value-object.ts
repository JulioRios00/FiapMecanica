import { DocumentType } from '@prisma/client';

export class Document {
  private readonly value: string;
  private readonly type: DocumentType;

  constructor(value: string, type: DocumentType) {
    this.value = this.sanitize(value);
    this.type = type;
    this.validate();
  }

  private sanitize(value: string): string {
    return value.replace(/\D/g, '');
  }

  private validate(): void {
    if (this.type === DocumentType.CPF) {
      this.validateCPF();
    } else if (this.type === DocumentType.CNPJ) {
      this.validateCNPJ();
    } else {
      throw new Error('Invalid document type');
    }
  }

  private validateCPF(): void {
    if (this.value.length !== 11) {
      throw new Error('CPF must have 11 digits');
    }

    // Check if all digits are the same
    if (/^(\d)\1{10}$/.test(this.value)) {
      throw new Error('Invalid CPF');
    }

    // Validate CPF checksum
    let sum = 0;
    let remainder: number;

    for (let i = 1; i <= 9; i++) {
      sum += parseInt(this.value.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(this.value.substring(9, 10))) {
      throw new Error('Invalid CPF');
    }

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(this.value.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(this.value.substring(10, 11))) {
      throw new Error('Invalid CPF');
    }
  }

  private validateCNPJ(): void {
    if (this.value.length !== 14) {
      throw new Error('CNPJ must have 14 digits');
    }

    // Check if all digits are the same
    if (/^(\d)\1{13}$/.test(this.value)) {
      throw new Error('Invalid CNPJ');
    }

    // Validate CNPJ checksum
    let length = this.value.length - 2;
    let numbers = this.value.substring(0, length);
    const digits = this.value.substring(length);
    let sum = 0;
    let pos = length - 7;

    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) {
      throw new Error('Invalid CNPJ');
    }

    length = length + 1;
    numbers = this.value.substring(0, length);
    sum = 0;
    pos = length - 7;

    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) {
      throw new Error('Invalid CNPJ');
    }
  }

  public getValue(): string {
    return this.value;
  }

  public getType(): DocumentType {
    return this.type;
  }

  public getFormatted(): string {
    if (this.type === DocumentType.CPF) {
      return this.value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      return this.value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  }
}

