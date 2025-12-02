import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { DocumentType } from '@prisma/client';
import { CreateCustomerUseCase } from './create-customer.use-case';
import { CustomerRepositoryPort } from '@application/ports/customer.repository.port';

describe('CreateCustomerUseCase', () => {
  let useCase: CreateCustomerUseCase;
  let repository: CustomerRepositoryPort;

  const mockCustomerRepository = {
    create: jest.fn(),
    findByDocument: jest.fn(),
    findByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCustomerUseCase,
        {
          provide: CustomerRepositoryPort,
          useValue: mockCustomerRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateCustomerUseCase>(CreateCustomerUseCase);
    repository = module.get<CustomerRepositoryPort>(CustomerRepositoryPort);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a customer successfully', async () => {
    const customerData = {
      name: 'John Doe',
      documentType: DocumentType.CPF,
      document: '12345678909',
      email: 'john@example.com',
      phone: '11987654321',
    };

    mockCustomerRepository.findByDocument.mockResolvedValue(null);
    mockCustomerRepository.findByEmail.mockResolvedValue(null);
    mockCustomerRepository.create.mockImplementation((customer) =>
      Promise.resolve(customer),
    );

    const result = await useCase.execute(customerData);

    expect(result).toBeDefined();
    expect(mockCustomerRepository.findByDocument).toHaveBeenCalledWith(
      customerData.document,
    );
    expect(mockCustomerRepository.findByEmail).toHaveBeenCalledWith(
      customerData.email,
    );
    expect(mockCustomerRepository.create).toHaveBeenCalled();
  });

  it('should throw ConflictException if document already exists', async () => {
    const customerData = {
      name: 'John Doe',
      documentType: DocumentType.CPF,
      document: '12345678909',
      email: 'john@example.com',
      phone: '11987654321',
    };

    mockCustomerRepository.findByDocument.mockResolvedValue({
      id: 'existing-customer',
    });

    await expect(useCase.execute(customerData)).rejects.toThrow(
      ConflictException,
    );
    await expect(useCase.execute(customerData)).rejects.toThrow(
      'Customer with this document already exists',
    );
  });

  it('should throw ConflictException if email already exists', async () => {
    const customerData = {
      name: 'John Doe',
      documentType: DocumentType.CPF,
      document: '12345678909',
      email: 'john@example.com',
      phone: '11987654321',
    };

    mockCustomerRepository.findByDocument.mockResolvedValue(null);
    mockCustomerRepository.findByEmail.mockResolvedValue({
      id: 'existing-customer',
    });

    await expect(useCase.execute(customerData)).rejects.toThrow(
      ConflictException,
    );
    await expect(useCase.execute(customerData)).rejects.toThrow(
      'Email already in use',
    );
  });
});

