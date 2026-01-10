import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DocumentType } from '@prisma/client';
import { CustomerRepositoryPort } from '@application/ports/customer.repository.port';
import { Customer } from '@domain/entities/customer.entity';

import { GetCustomerUseCase } from './get-customer.use-case';

describe('GetCustomerUseCase', () => {
  let useCase: GetCustomerUseCase;

  const mockCustomerRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCustomerUseCase,
        {
          provide: CustomerRepositoryPort,
          useValue: mockCustomerRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetCustomerUseCase>(GetCustomerUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get a customer successfully', async () => {
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

    const result = await useCase.execute(customerId);

    expect(mockCustomerRepository.findById).toHaveBeenCalledWith(customerId);
    expect(result).toBe(customer);
  });

  it('should throw NotFoundException if customer does not exist', async () => {
    const customerId = 'non-existent-id';

    mockCustomerRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(customerId)).rejects.toThrow(
      new NotFoundException('Customer not found'),
    );
    expect(mockCustomerRepository.findById).toHaveBeenCalledWith(customerId);
  });
});
