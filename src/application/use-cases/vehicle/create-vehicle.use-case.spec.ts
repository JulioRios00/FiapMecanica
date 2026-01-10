import { VehicleRepositoryPort } from '@application/ports/vehicle.repository.port';
import { Vehicle } from '@domain/entities/vehicle.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentType } from '@prisma/client';
import { CustomerRepositoryPort } from '@application/ports/customer.repository.port';
import { Customer } from '@domain/entities/customer.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { CreateVehicleUseCase } from './create-vehicle.use-case';

const customer = new Customer({
  id: 'customer-id',
  name: 'John Doe',
  documentType: DocumentType.CPF,
  document: '12345678909',
  email: 'john@example.com',
  phone: '11987654321',
});

const makeVehicle = (customerId = 'customer-id') => ({
  customerId: customerId,
  brand: 'Toyota',
  model: 'Corolla',
  year: 2020,
  licensePlate: 'ABC-1234',
  color: 'White',
});

describe('CreateVehicleUseCase', () => {
  let useCase: CreateVehicleUseCase;

  const mockVehicleRepository = {
    create: jest.fn(),
    findByLicensePlate: jest.fn(),
  };

  const mockCustomerRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateVehicleUseCase,
        {
          provide: VehicleRepositoryPort,
          useValue: mockVehicleRepository,
        },
        {
          provide: CustomerRepositoryPort,
          useValue: mockCustomerRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateVehicleUseCase>(CreateVehicleUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a vehicle successfully', async () => {
    const vehicleData = makeVehicle();
    const vehicleObj = new Vehicle(vehicleData);

    mockCustomerRepository.findById.mockResolvedValue(customer);
    mockVehicleRepository.findByLicensePlate.mockResolvedValue(null);
    mockVehicleRepository.create.mockResolvedValue(vehicleObj);

    const result = await useCase.execute(vehicleData);

    expect(mockCustomerRepository.findById).toHaveBeenCalledWith(vehicleData.customerId);
    expect(mockVehicleRepository.findByLicensePlate).toHaveBeenCalledWith(vehicleData.licensePlate);
    expect(mockVehicleRepository.create).toHaveBeenCalled();
    expect(result).toBe(vehicleObj);
  });

  it('should throw NotFoundException if customer does not exist', async () => {
    const vehicleData = makeVehicle('non-existent-customer');
    mockCustomerRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(vehicleData)).rejects.toThrow(
      new NotFoundException('Customer not found'),
    );
    expect(mockCustomerRepository.findById).toHaveBeenCalledWith(vehicleData.customerId);
    expect(mockVehicleRepository.create).not.toHaveBeenCalled();
  });

  it('should throw ConflictException if license plate already exists', async () => {
    const vehicleData = makeVehicle();

    mockCustomerRepository.findById.mockResolvedValue(customer);
    mockVehicleRepository.findByLicensePlate.mockResolvedValue({
      id: 'existing-vehicle',
    });

    await expect(useCase.execute(vehicleData)).rejects.toThrow(
      new ConflictException('Vehicle with this license plate already exists'),
    );
    expect(mockVehicleRepository.findByLicensePlate).toHaveBeenCalledWith(vehicleData.licensePlate);
    expect(mockVehicleRepository.create).not.toHaveBeenCalled();
  });
});
