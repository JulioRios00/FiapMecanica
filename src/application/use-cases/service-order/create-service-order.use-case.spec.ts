import { VehicleRepositoryPort } from '@application/ports/vehicle.repository.port';
import { Vehicle } from '@domain/entities/vehicle.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { ServiceRepositoryPort } from '@application/ports/service.repository.port';
import { ServiceOrderRepositoryPort } from '@application/ports/service-order.repository.port';
import { Service } from '@domain/entities/service.entity';
import { PartRepositoryPort } from '@application/ports/part.repository.port';
import { Part } from '@domain/entities/part.entity';
import { NotFoundException } from '@nestjs/common';
import { DocumentType, ServiceCategory } from '@prisma/client';
import { CustomerRepositoryPort } from '@application/ports/customer.repository.port';
import { Customer } from '@domain/entities/customer.entity';
import { ServiceInactiveException } from '@shared/exceptions/service-inactive.exception';
import { InsufficientStockException } from '@shared/exceptions/insufficient-stock.exception';
import { VehicleOwnershipException } from '@shared/exceptions/vehicle-ownership.exception';

import { CreateServiceOrderUseCase } from './create-service-order.use-case';

const customer = new Customer({
  id: 'customer-id',
  name: 'John Doe',
  documentType: DocumentType.CPF,
  document: '12345678909',
  email: 'john@example.com',
  phone: '11987654321',
});

const makeVehicle = (customerId = 'customer-id') =>
  new Vehicle({
    id: 'vehicle-id',
    customerId: customerId,
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    licensePlate: 'ABC-1234',
    color: 'White',
  });

const makeService = (active = true) =>
  new Service({
    id: 'service-id',
    name: 'Oil Change',
    description: 'Complete oil change',
    price: 100.0,
    estimatedDuration: 30,
    category: ServiceCategory.MAINTENANCE,
    active,
  });

const makePart = (active = true) =>
  new Part({
    id: 'part-id',
    name: 'Brake Pad',
    partNumber: 'BP-001',
    description: 'Front brake pad',
    price: 150.0,
    stockQuantity: 5,
    minStockLevel: 5,
    active,
  });

const makeInput = (
  id = 'customer-id',
  services = [{ serviceId: 'service-id', quantity: 1 }],
  parts = [{ partId: 'part-id', quantity: 1 }],
) => ({
  customerId: id,
  vehicleId: 'vehicle-id',
  description: 'Regular maintenance',
  services,
  parts,
});

describe('CreateServiceOrderUseCase', () => {
  let useCase: CreateServiceOrderUseCase;

  const mockServiceOrderRepository = {
    create: jest.fn(),
  };

  const mockCustomerRepository = {
    findById: jest.fn(),
  };

  const mockVehicleRepository = {
    findById: jest.fn(),
  };

  const mockServiceRepository = {
    findById: jest.fn(),
  };

  const mockPartRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateServiceOrderUseCase,
        {
          provide: ServiceOrderRepositoryPort,
          useValue: mockServiceOrderRepository,
        },
        {
          provide: CustomerRepositoryPort,
          useValue: mockCustomerRepository,
        },
        {
          provide: VehicleRepositoryPort,
          useValue: mockVehicleRepository,
        },
        {
          provide: ServiceRepositoryPort,
          useValue: mockServiceRepository,
        },
        {
          provide: PartRepositoryPort,
          useValue: mockPartRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateServiceOrderUseCase>(CreateServiceOrderUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a service order successfully with services only', async () => {
    const vehicle = makeVehicle();
    const service = makeService();
    const input = makeInput(undefined, undefined, []);

    mockCustomerRepository.findById.mockResolvedValue(customer);
    mockVehicleRepository.findById.mockResolvedValue(vehicle);
    mockServiceRepository.findById.mockResolvedValue(service);
    mockServiceOrderRepository.create.mockResolvedValue({
      id: 'order-id',
      totalAmount: 200.0,
    });

    const result = await useCase.execute(input);

    expect(result).toBeDefined();
    expect(mockCustomerRepository.findById).toHaveBeenCalledWith(input.customerId);
    expect(mockVehicleRepository.findById).toHaveBeenCalledWith(input.vehicleId);
    expect(mockServiceRepository.findById).toHaveBeenCalledWith('service-id');
    expect(mockServiceOrderRepository.create).toHaveBeenCalled();
  });

  it('should create a service order successfully with parts only', async () => {
    const vehicle = makeVehicle();
    const part = makePart();
    const input = makeInput(undefined, []);

    mockCustomerRepository.findById.mockResolvedValue(customer);
    mockVehicleRepository.findById.mockResolvedValue(vehicle);
    mockPartRepository.findById.mockResolvedValue(part);
    mockServiceOrderRepository.create.mockResolvedValue({
      id: 'order-id',
      totalAmount: 300.0,
    });

    const result = await useCase.execute(input);

    expect(result).toBeDefined();
    expect(mockPartRepository.findById).toHaveBeenCalledWith('part-id');
    expect(mockServiceOrderRepository.create).toHaveBeenCalled();
  });

  it('should throw NotFoundException if customer does not exist', async () => {
    const input = makeInput('non-existent-customer');

    mockCustomerRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toThrow(
      new NotFoundException('Customer not found'),
    );
  });

  it('should throw NotFoundException if vehicle does not exist', async () => {
    const input = makeInput();

    mockCustomerRepository.findById.mockResolvedValue(customer);
    mockVehicleRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toThrow(
      new NotFoundException('Vehicle not found'),
    );
  });

  it('should throw BadRequestException if vehicle does not belong to customer', async () => {
    const vehicle = makeVehicle('different-customer-id');
    const input = makeInput();

    mockCustomerRepository.findById.mockResolvedValue(customer);
    mockVehicleRepository.findById.mockResolvedValue(vehicle);

    await expect(useCase.execute(input)).rejects.toThrow(VehicleOwnershipException);
  });

  it('should throw NotFoundException if service does not exist', async () => {
    const vehicle = makeVehicle();
    const input = makeInput(undefined, [{ serviceId: 'non-existent-service', quantity: 1 }]);

    mockCustomerRepository.findById.mockResolvedValue(customer);
    mockVehicleRepository.findById.mockResolvedValue(vehicle);
    mockServiceRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toThrow(
      new NotFoundException('Service non-existent-service not found'),
    );
  });

  it('should throw BadRequestException if service is not active', async () => {
    const vehicle = makeVehicle();
    const service = makeService(false);
    const input = makeInput();

    mockCustomerRepository.findById.mockResolvedValue(customer);
    mockVehicleRepository.findById.mockResolvedValue(vehicle);
    mockServiceRepository.findById.mockResolvedValue(service);

    await expect(useCase.execute(input)).rejects.toThrow(ServiceInactiveException);
  });

  it('should throw NotFoundException if part does not exist', async () => {
    const vehicle = makeVehicle();
    const input = makeInput(undefined, [], [{ partId: 'non-existent-part', quantity: 1 }]);

    mockCustomerRepository.findById.mockResolvedValue(customer);
    mockVehicleRepository.findById.mockResolvedValue(vehicle);
    mockPartRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toThrow(
      new NotFoundException('Part non-existent-part not found'),
    );
  });

  it('should throw BadRequestException if part is not active', async () => {
    const vehicle = makeVehicle();
    const part = makePart(false);
    const input = makeInput(undefined, []);

    mockCustomerRepository.findById.mockResolvedValue(customer);
    mockVehicleRepository.findById.mockResolvedValue(vehicle);
    mockPartRepository.findById.mockResolvedValue(part);

    await expect(useCase.execute(input)).rejects.toThrow(ServiceInactiveException);
  });

  it('should throw BadRequestException if insufficient stock', async () => {
    const vehicle = makeVehicle();
    const part = makePart();
    const input = makeInput(undefined, [], [{ partId: 'part-id', quantity: 10 }]);

    mockCustomerRepository.findById.mockResolvedValue(customer);
    mockVehicleRepository.findById.mockResolvedValue(vehicle);
    mockPartRepository.findById.mockResolvedValue(part);

    await expect(useCase.execute(input)).rejects.toThrow(InsufficientStockException);
  });
});
