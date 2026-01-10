import { UpdateCustomerUseCase } from '@application/use-cases/customer/update-customer.use-case';
import { Test, TestingModule } from '@nestjs/testing';
import { ListCustomersUseCase } from '@application/use-cases/customer/list-customers.use-case';
import { GetCustomerUseCase } from '@application/use-cases/customer/get-customer.use-case';
import { DocumentType } from '@prisma/client';
import { DeleteCustomerUseCase } from '@application/use-cases/customer/delete-customer.use-case';
import { Customer } from '@domain/entities/customer.entity';
import { CreateCustomerUseCase } from '@application/use-cases/customer/create-customer.use-case';

import { CustomerController } from './customer.controller';

const customerDto = {
  name: 'John Doe',
  documentType: DocumentType.CPF,
  document: '12345678909',
  email: 'john@example.com',
  phone: '11987654321',
};

const customer = new Customer({
  id: 'customer-1',
  ...customerDto,
});

describe('CustomerController', () => {
  let controller: CustomerController;

  const mockCreateCustomerUseCase = {
    execute: jest.fn(),
  };

  const mockUpdateCustomerUseCase = {
    execute: jest.fn(),
  };

  const mockGetCustomerUseCase = {
    execute: jest.fn(),
  };

  const mockListCustomersUseCase = {
    execute: jest.fn(),
  };

  const mockDeleteCustomerUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        {
          provide: CreateCustomerUseCase,
          useValue: mockCreateCustomerUseCase,
        },
        {
          provide: UpdateCustomerUseCase,
          useValue: mockUpdateCustomerUseCase,
        },
        {
          provide: GetCustomerUseCase,
          useValue: mockGetCustomerUseCase,
        },
        {
          provide: ListCustomersUseCase,
          useValue: mockListCustomersUseCase,
        },
        {
          provide: DeleteCustomerUseCase,
          useValue: mockDeleteCustomerUseCase,
        },
      ],
    }).compile();

    controller = module.get<CustomerController>(CustomerController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a customer', async () => {
      mockCreateCustomerUseCase.execute.mockResolvedValue(customer);

      const result = await controller.create(customerDto);

      expect(result).toEqual(customer.toJSON());
      expect(mockCreateCustomerUseCase.execute).toHaveBeenCalledWith(customerDto);
    });
  });

  describe('findAll', () => {
    it('should list customers without filters', async () => {
      const customers = [customer];

      const expectedResult = {
        data: customers,
        total: 1,
        page: 1,
        limit: 10,
      };

      mockListCustomersUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual({
        ...expectedResult,
        data: [customers[0].toJSON()],
      });
      expect(mockListCustomersUseCase.execute).toHaveBeenCalledWith({
        active: undefined,
        page: undefined,
        limit: undefined,
      });
    });

    it('should list customers with filters', async () => {
      const customers = [customer];

      const expectedResult = {
        data: customers,
        total: 1,
        page: 1,
        limit: 10,
      };

      mockListCustomersUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.findAll('true', '1', '10');

      expect(result).toEqual({
        ...expectedResult,
        data: [customers[0].toJSON()],
      });
      expect(mockListCustomersUseCase.execute).toHaveBeenCalledWith({
        active: true,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('findOne', () => {
    it('should get a customer by id', async () => {
      const input = 'customer-id';
      mockGetCustomerUseCase.execute.mockResolvedValue(customer);

      const result = await controller.findOne(input);

      expect(result).toEqual(customer.toJSON());
      expect(mockGetCustomerUseCase.execute).toHaveBeenCalledWith(input);
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      const updateDto = {
        name: 'Any Doe',
      };

      mockUpdateCustomerUseCase.execute.mockResolvedValue(customer);

      const result = await controller.update('customer-id', updateDto);

      expect(result).toEqual(customer.toJSON());
      expect(mockUpdateCustomerUseCase.execute).toHaveBeenCalledWith('customer-id', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a customer', async () => {
      await controller.remove('customer-id');

      expect(mockDeleteCustomerUseCase.execute).toHaveBeenCalledWith('customer-id');
    });
  });
});
