import { Test, TestingModule } from '@nestjs/testing';
import { DocumentType } from '@prisma/client';
import { Customer } from '@domain/entities/customer.entity';

import { PrismaService } from '../database/prisma.service';
import { CustomerRepository } from './customer.repository';

const customerData = {
  id: 'customer-id',
  name: 'John Doe',
  documentType: DocumentType.CPF,
  document: '12345678909',
  email: 'john@example.com',
  phone: '11987654321',
  address: null,
  city: null,
  state: null,
  zipCode: null,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const customer = new Customer({
  id: 'customer-id',
  name: 'John Doe',
  documentType: DocumentType.CPF,
  document: '12345678909',
  email: 'john@example.com',
  phone: '11987654321',
});

describe('CustomerRepository', () => {
  let repository: CustomerRepository;

  const mockPrismaService = {
    customer: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<CustomerRepository>(CustomerRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a customer', async () => {
      const customer = new Customer({
        name: 'John Doe',
        documentType: DocumentType.CPF,
        document: '12345678909',
        email: 'john@example.com',
        phone: '11987654321',
      });

      mockPrismaService.customer.create.mockResolvedValue(customerData);

      const result = await repository.create(customer);

      expect(result).toBeInstanceOf(Customer);
      expect(mockPrismaService.customer.create).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should find a customer by id', async () => {
      const input = 'customer-id';
      mockPrismaService.customer.findUnique.mockResolvedValue(customerData);

      const result = await repository.findById(input);

      expect(result).toBeInstanceOf(Customer);
      expect(result?.getId()).toBe(input);
      expect(mockPrismaService.customer.findUnique).toHaveBeenCalledWith({
        where: { id: input },
      });
    });

    it('should return null if customer not found', async () => {
      const input = 'non-existent-id';
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      const result = await repository.findById(input);

      expect(result).toBeNull();
    });
  });

  describe('findByDocument', () => {
    it('should find a customer by document', async () => {
      const input = '12345678909';
      mockPrismaService.customer.findUnique.mockResolvedValue(customerData);

      const result = await repository.findByDocument(input);

      expect(result).toBeInstanceOf(Customer);
    });

    it('should return null if customer not found', async () => {
      const input = '77209585001';
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      const result = await repository.findByDocument(input);

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find a customer by email', async () => {
      const input = 'john@example.com';
      mockPrismaService.customer.findFirst.mockResolvedValue(customerData);

      const result = await repository.findByEmail(input);

      expect(result).toBeInstanceOf(Customer);
    });

    it('should return null if customer not found', async () => {
      const input = 'any@example.com';
      mockPrismaService.customer.findFirst.mockResolvedValue(null);

      const result = await repository.findByEmail(input);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all customers with pagination', async () => {
      const customersData = [customerData];

      mockPrismaService.customer.findMany.mockResolvedValue(customersData);
      mockPrismaService.customer.count.mockResolvedValue(1);

      const result = await repository.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should find all customers without pagination', async () => {
      const customersData = [customerData];

      mockPrismaService.customer.findMany.mockResolvedValue(customersData);
      mockPrismaService.customer.count.mockResolvedValue(1);

      const result = await repository.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should find all active customers', async () => {
      const customersData = [customerData];

      mockPrismaService.customer.findMany.mockResolvedValue(customersData);
      mockPrismaService.customer.count.mockResolvedValue(1);

      const result = await repository.findAll({ active: true });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should find all inactive customers', async () => {
      const customersData = [customerData];

      mockPrismaService.customer.findMany.mockResolvedValue(customersData);
      mockPrismaService.customer.count.mockResolvedValue(1);

      const result = await repository.findAll({ active: false });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      const updatedData = {
        ...customerData,
        name: 'Jane Doe',
      };

      mockPrismaService.customer.update.mockResolvedValue(updatedData);

      const result = await repository.update('customer-id', customer);

      expect(result).toBeInstanceOf(Customer);
      expect(mockPrismaService.customer.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a customer', async () => {
      const input = 'customer-id';
      await repository.delete(input);

      expect(mockPrismaService.customer.delete).toHaveBeenCalledWith({
        where: { id: input },
      });
    });
  });
});
