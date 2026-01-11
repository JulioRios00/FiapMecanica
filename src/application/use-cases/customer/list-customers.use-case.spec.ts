import { Test, TestingModule } from '@nestjs/testing';
import { DocumentType } from '@prisma/client';
import { CustomerRepositoryPort } from '@application/ports/customer.repository.port';
import { Customer } from '@domain/entities/customer.entity';

import { ListCustomersUseCase } from './list-customers.use-case';

describe('ListCustomersUseCase', () => {
  let useCase: ListCustomersUseCase;

  const mockCustomerRepository = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListCustomersUseCase,
        {
          provide: CustomerRepositoryPort,
          useValue: mockCustomerRepository,
        },
      ],
    }).compile();

    useCase = module.get<ListCustomersUseCase>(ListCustomersUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should list customers successfully without params', async () => {
    const customers = [
      new Customer({
        id: 'customer-1',
        name: 'John Doe',
        documentType: DocumentType.CPF,
        document: '12345678909',
        email: 'john@example.com',
        phone: '11987654321',
      }),
    ];

    const expectedResult = {
      data: customers,
      total: 1,
      page: 1,
      limit: 10,
    };

    mockCustomerRepository.findAll.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(result).toEqual(expectedResult);
    expect(mockCustomerRepository.findAll).toHaveBeenCalledWith(undefined);
  });

  it('should list customers successfully with params', async () => {
    const customers = [
      new Customer({
        id: 'customer-1',
        name: 'John Doe',
        documentType: DocumentType.CPF,
        document: '12345678909',
        email: 'john@example.com',
        phone: '11987654321',
      }),
      new Customer({
        id: 'customer-2',
        name: 'Any Doe',
        documentType: DocumentType.CPF,
        document: '77209585001',
        email: 'any@example.com',
        phone: '11987654321',
      }),
    ];

    const params = { active: true, page: 1, limit: 20 };
    const expectedResult = {
      data: customers,
      total: 2,
      page: 1,
      limit: 20,
    };

    mockCustomerRepository.findAll.mockResolvedValue(expectedResult);

    const result = await useCase.execute(params);

    expect(result).toEqual(expectedResult);
    expect(mockCustomerRepository.findAll).toHaveBeenCalledWith(params);
  });

  it('should list customers empty list', async () => {
    const customers = [];

    const expectedResult = {
      data: customers,
      total: 0,
      page: 1,
      limit: 10,
    };

    mockCustomerRepository.findAll.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(result).toEqual(expectedResult);
    expect(mockCustomerRepository.findAll).toHaveBeenCalledWith(undefined);
  });
});
