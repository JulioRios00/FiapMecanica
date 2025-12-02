import { DocumentType } from '@prisma/client';
import { Customer, CustomerProps } from './customer.entity';

describe('Customer Entity', () => {
  const validCustomerProps: CustomerProps = {
    name: 'John Doe',
    documentType: DocumentType.CPF,
    document: '12345678909',
    email: 'john@example.com',
    phone: '11987654321',
  };

  describe('Creation', () => {
    it('should create a valid customer', () => {
      const customer = new Customer(validCustomerProps);
      expect(customer.getName()).toBe('John Doe');
      expect(customer.getEmail().getValue()).toBe('john@example.com');
      expect(customer.isActive()).toBe(true);
    });

    it('should reject customer with name less than 3 characters', () => {
      const invalidProps = { ...validCustomerProps, name: 'Jo' };
      expect(() => new Customer(invalidProps)).toThrow(
        'Customer name must have at least 3 characters',
      );
    });

    it('should reject customer with invalid phone', () => {
      const invalidProps = { ...validCustomerProps, phone: '123' };
      expect(() => new Customer(invalidProps)).toThrow('Invalid phone number');
    });

    it('should reject customer with invalid email', () => {
      const invalidProps = { ...validCustomerProps, email: 'invalid-email' };
      expect(() => new Customer(invalidProps)).toThrow('Invalid email format');
    });
  });

  describe('Update', () => {
    it('should update customer information', () => {
      const customer = new Customer(validCustomerProps);
      customer.updateInfo({ name: 'Jane Doe', phone: '11999999999' });
      
      expect(customer.getName()).toBe('Jane Doe');
      expect(customer.getPhone()).toBe('11999999999');
    });

    it('should update email correctly', () => {
      const customer = new Customer(validCustomerProps);
      customer.updateInfo({ email: 'jane@example.com' });
      
      expect(customer.getEmail().getValue()).toBe('jane@example.com');
    });
  });

  describe('Activation/Deactivation', () => {
    it('should deactivate customer', () => {
      const customer = new Customer(validCustomerProps);
      customer.deactivate();
      
      expect(customer.isActive()).toBe(false);
    });

    it('should activate customer', () => {
      const customer = new Customer({ ...validCustomerProps, active: false });
      customer.activate();
      
      expect(customer.isActive()).toBe(true);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON correctly', () => {
      const customer = new Customer(validCustomerProps);
      const json = customer.toJSON();

      expect(json.name).toBe('John Doe');
      expect(json.document).toBe('12345678909');
      expect(json.email).toBe('john@example.com');
      expect(json.active).toBe(true);
    });
  });
});

