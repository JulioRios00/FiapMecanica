import { DocumentType } from '@prisma/client';

import { Document } from './document.value-object';

describe('Document Value Object', () => {
  describe('CPF Validation', () => {
    it('should accept valid CPF', () => {
      const validCPF = '12345678909'; // Valid CPF
      expect(() => new Document(validCPF, DocumentType.CPF)).not.toThrow();
    });

    it('should reject CPF with invalid length', () => {
      const invalidCPF = '123456789';
      expect(() => new Document(invalidCPF, DocumentType.CPF)).toThrow('CPF must have 11 digits');
    });

    it('should reject CPF with false first digit selector', () => {
      const invalidCPF = '12345678910';
      expect(() => new Document(invalidCPF, DocumentType.CPF)).toThrow('Invalid CPF');
    });

    it('should reject CPF with false second digit selector', () => {
      const invalidCPF = '12345678908';
      expect(() => new Document(invalidCPF, DocumentType.CPF)).toThrow('Invalid CPF');
    });

    it('should reject CPF with all same digits', () => {
      const invalidCPF = '11111111111';
      expect(() => new Document(invalidCPF, DocumentType.CPF)).toThrow('Invalid CPF');
    });

    it('should sanitize CPF removing non-numeric characters', () => {
      const cpf = '123.456.789-09';
      const document = new Document(cpf, DocumentType.CPF);
      expect(document.getValue()).toBe('12345678909');
    });

    it('should format CPF correctly', () => {
      const cpf = '12345678909';
      const document = new Document(cpf, DocumentType.CPF);
      expect(document.getFormatted()).toBe('123.456.789-09');
    });

    it('should reject invalid document type', () => {
      const invalidCPF = '11111111111';
      // @ts-expect-error - test wrong document type
      expect(() => new Document(invalidCPF, 'RG')).toThrow('Invalid document type');
    });
  });

  describe('CNPJ Validation', () => {
    it('should accept valid CNPJ', () => {
      const validCNPJ = '11222333000181'; // Valid CNPJ
      expect(() => new Document(validCNPJ, DocumentType.CNPJ)).not.toThrow();
    });

    it('should reject CNPJ with invalid length', () => {
      const invalidCNPJ = '1122233300018';
      expect(() => new Document(invalidCNPJ, DocumentType.CNPJ)).toThrow(
        'CNPJ must have 14 digits',
      );
    });

    it('should reject CNPJ with all same digits', () => {
      const invalidCNPJ = '11111111111111';
      expect(() => new Document(invalidCNPJ, DocumentType.CNPJ)).toThrow('Invalid CNPJ');
    });

    it('should reject CNPJ with false first digit selector', () => {
      const invalidCNPJ = '12345678000105';
      expect(() => new Document(invalidCNPJ, DocumentType.CNPJ)).toThrow('Invalid CNPJ');
    });

    it('should reject CNPJ with false second digit selector', () => {
      const invalidCNPJ = '12345678000190';
      expect(() => new Document(invalidCNPJ, DocumentType.CNPJ)).toThrow('Invalid CNPJ');
    });

    it('should sanitize CNPJ removing non-numeric characters', () => {
      const cnpj = '11.222.333/0001-81';
      const document = new Document(cnpj, DocumentType.CNPJ);
      expect(document.getValue()).toBe('11222333000181');
    });

    it('should format CNPJ correctly', () => {
      const cnpj = '11222333000181';
      const document = new Document(cnpj, DocumentType.CNPJ);
      expect(document.getFormatted()).toBe('11.222.333/0001-81');
    });
  });
});
