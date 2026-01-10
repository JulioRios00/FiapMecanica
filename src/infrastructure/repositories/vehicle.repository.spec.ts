import { Vehicle } from '@domain/entities/vehicle.entity';
import { Test, TestingModule } from '@nestjs/testing';

import { VehicleRepository } from './vehicle.repository';
import { PrismaService } from '../database/prisma.service';

const vehicle = new Vehicle({
  customerId: 'customer-id',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2020,
  licensePlate: 'ABC-1234',
  color: 'White',
});

const vehicleData = {
  id: 'vehicle-id',
  customerId: 'customer-id',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2020,
  licensePlate: 'ABC-1234',
  color: 'White',
  chassisNumber: null,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('VehicleRepository', () => {
  let repository: VehicleRepository;

  const mockPrismaService = {
    vehicle: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<VehicleRepository>(VehicleRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a vehicle', async () => {
      mockPrismaService.vehicle.create.mockResolvedValue(vehicleData);

      const result = await repository.create(vehicle);

      expect(result).toBeInstanceOf(Vehicle);
      expect(mockPrismaService.vehicle.create).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should find a vehicle by id', async () => {
      const input = 'vehicle-id';
      mockPrismaService.vehicle.findUnique.mockResolvedValue(vehicleData);

      const result = await repository.findById(input);

      expect(result).toBeInstanceOf(Vehicle);
    });

    it('should return null if vehicle not found', async () => {
      const input = 'non-existent-id';
      mockPrismaService.vehicle.findUnique.mockResolvedValue(null);

      const result = await repository.findById(input);

      expect(result).toBeNull();
    });
  });

  describe('findByLicensePlate', () => {
    it('should find a vehicle by license plate', async () => {
      const input = 'ABC-1234';
      mockPrismaService.vehicle.findUnique.mockResolvedValue(vehicleData);

      const result = await repository.findByLicensePlate(input);

      expect(result).toBeInstanceOf(Vehicle);
    });

    it('should return null if vehicle not found', async () => {
      const input = 'ABC-1234';
      mockPrismaService.vehicle.findUnique.mockResolvedValue(null);

      const result = await repository.findByLicensePlate(input);

      expect(result).toBeNull();
    });
  });

  describe('findByCustomerId', () => {
    it('should find all vehicles by customer id', async () => {
      const vehiclesData = [vehicleData];

      mockPrismaService.vehicle.findMany.mockResolvedValue(vehiclesData);
      const result = await repository.findByCustomerId('customer-id');

      expect(result[0]).toBeInstanceOf(Vehicle);
    });
  });

  describe('findAll', () => {
    it('should find all vehicles with pagination', async () => {
      const vehiclesData = [vehicleData];

      mockPrismaService.vehicle.findMany.mockResolvedValue(vehiclesData);
      mockPrismaService.vehicle.count.mockResolvedValue(1);

      const result = await repository.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should find all vehicles without pagination', async () => {
      const vehiclesData = [vehicleData];

      mockPrismaService.vehicle.findMany.mockResolvedValue(vehiclesData);
      mockPrismaService.vehicle.count.mockResolvedValue(1);

      const result = await repository.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should find all active vehicles', async () => {
      const vehiclesData = [vehicleData];

      mockPrismaService.vehicle.findMany.mockResolvedValue(vehiclesData);
      mockPrismaService.vehicle.count.mockResolvedValue(1);

      const result = await repository.findAll({ active: true });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should find all inactive vehicles', async () => {
      const vehiclesData = [vehicleData];

      mockPrismaService.vehicle.findMany.mockResolvedValue(vehiclesData);
      mockPrismaService.vehicle.count.mockResolvedValue(1);

      const result = await repository.findAll({ active: false });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('update', () => {
    it('should update a vehicle', async () => {
      const updatedData = {
        ...vehicleData,
        color: 'Black',
      };

      mockPrismaService.vehicle.update.mockResolvedValue(updatedData);

      const result = await repository.update('vehicle-id', vehicle);

      expect(result).toBeInstanceOf(Vehicle);
      expect(mockPrismaService.vehicle.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a vehicle', async () => {
      const input = 'vehicle-id';
      await repository.delete(input);

      expect(mockPrismaService.vehicle.delete).toHaveBeenCalledWith({
        where: { id: input },
      });
    });
  });
});
