import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DocumentType } from '@prisma/client';
import { CustomerRepositoryPort } from '@application/ports/customer.repository.port';
import { Customer } from '@domain/entities/customer.entity';

import { DeleteCustomerUseCase } from './delete-customer.use-case';

describe('DeleteCustomerUseCase', () => {
  let useCase: DeleteCustomerUseCase;

  const mockCustomerRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCustomerUseCase,
        {
          provide: CustomerRepositoryPort,
          useValue: mockCustomerRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteCustomerUseCase>(DeleteCustomerUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a customer successfully', async () => {
    const customerId = 'customer-id';
    const customer = new Customer({
      id: customerId,
      name: 'John Doe',
      documentType: DocumentType.CPF,
      document: '12345678909',
      email: 'john@example.com',
      phone: '11987654321',
    });

    mockCustomerRepository.findById.mockResolvedValue(customer);

    await useCase.execute(customerId);

    expect(mockCustomerRepository.findById).toHaveBeenCalledWith(customerId);
    expect(customer.isActive()).toBe(false);
    expect(mockCustomerRepository.update).toHaveBeenCalledWith(customerId, customer);
  });

  it('should throw NotFoundException if customer does not exist', async () => {
    const customerId = 'non-existent-id';

    mockCustomerRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(customerId)).rejects.toThrow(
      new NotFoundException('Customer not found'),
    );
    expect(mockCustomerRepository.findById).toHaveBeenCalledWith(customerId);
    expect(mockCustomerRepository.update).not.toHaveBeenCalled();
  });
});
