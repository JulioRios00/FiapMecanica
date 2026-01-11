import { DocumentType } from '@prisma/client';

import { Customer, CustomerProps } from './customer.entity';

describe('Customer Entity', () => {
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
  jest.setSystemTime(new Date(2023, 10, 31));

  const validCustomerProps: CustomerProps = {
    id: 'customer-id',
    name: 'John Doe',
    documentType: DocumentType.CPF,
    document: '12345678909',
    email: 'john@example.com',
    phone: '11987654321',
    address: '8128 Beebe Rd',
    city: 'Chincoteague Island',
    state: 'Virginia',
    zipCode: '23336',
    createdAt: new Date(),
    updatedAt: new Date(),
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
      const input = {
        name: 'Jane Doe',
        phone: '11999999999',
        email: 'jane@example.com',
        address: '1050 Glenbrook Way #48',
        city: 'Hendersonville',
        state: 'Tennessee',
        zipCode: '37075',
      };
      customer.updateInfo(input);

      expect(customer.getId()).toBe('customer-id');
      expect(customer.getName()).toBe('Jane Doe');
      expect(customer.getDocument()).toEqual({ type: 'CPF', value: '12345678909' });
      expect(customer.getEmail()).toEqual({ value: 'jane@example.com' });
      expect(customer.getPhone()).toBe('11999999999');
      expect(customer.getAddress()).toBe('1050 Glenbrook Way #48');
      expect(customer.getCity()).toBe('Hendersonville');
      expect(customer.getState()).toBe('Tennessee');
      expect(customer.getZipCode()).toBe('37075');
      expect(customer.isActive()).toBe(true);
      expect(customer.getCreatedAt()).toEqual(new Date());
      expect(customer.getUpdatedAt()).toEqual(new Date());
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
