import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DocumentType } from '@prisma/client';
import { CustomerRepositoryPort } from '@application/ports/customer.repository.port';
import { Customer } from '@domain/entities/customer.entity';

import { UpdateCustomerUseCase } from './update-customer.use-case';

describe('UpdateCustomerUseCase', () => {
  let useCase: UpdateCustomerUseCase;

  const mockCustomerRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCustomerUseCase,
        {
          provide: CustomerRepositoryPort,
          useValue: mockCustomerRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateCustomerUseCase>(UpdateCustomerUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update a customer successfully', async () => {
    const customerId = 'customer-id';
    const customer = new Customer({
      id: customerId,
      name: 'John Doe',
      documentType: DocumentType.CPF,
      document: '12345678909',
      email: 'john@example.com',
      phone: '11987654321',
    });

    const updateData = {
      name: 'Jane Doe',
      phone: '11999999999',
    };

    const updatedCustomer = new Customer({
      ...customer.toJSON(),
      ...updateData,
    });

    mockCustomerRepository.findById.mockResolvedValue(customer);
    mockCustomerRepository.update.mockResolvedValue(updatedCustomer);

    const result = await useCase.execute(customerId, updateData);

    expect(mockCustomerRepository.findById).toHaveBeenCalledWith(customerId);
    expect(mockCustomerRepository.update).toHaveBeenCalledWith(customerId, customer);
    expect(result).toBe(updatedCustomer);
  });

  it('should throw NotFoundException if customer does not exist', async () => {
    const customerId = 'non-existent-id';
    const updateData = {
      name: 'Jane Doe',
    };

    mockCustomerRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(customerId, updateData)).rejects.toThrow(
      new NotFoundException('Customer not found'),
    );
    expect(mockCustomerRepository.findById).toHaveBeenCalledWith(customerId);
    expect(mockCustomerRepository.update).not.toHaveBeenCalled();
  });
});
