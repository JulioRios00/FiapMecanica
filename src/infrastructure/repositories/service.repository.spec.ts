import { Test, TestingModule } from '@nestjs/testing';
import { ServiceCategory } from '@prisma/client';
import { Service } from '@domain/entities/service.entity';

import { ServiceRepository } from './service.repository';
import { PrismaService } from '../database/prisma.service';

const service = new Service({
  name: 'Oil Change',
  description: 'Complete oil change service',
  price: 100.0,
  estimatedDuration: 30,
  category: ServiceCategory.MAINTENANCE,
});

const serviceData = {
  id: 'service-id',
  name: 'Oil Change',
  description: 'Complete oil change service',
  price: 100.0,
  estimatedDuration: 30,
  category: ServiceCategory.MAINTENANCE,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ServiceRepository', () => {
  let repository: ServiceRepository;

  const mockPrismaService = {
    service: {
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
        ServiceRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<ServiceRepository>(ServiceRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a service', async () => {
      mockPrismaService.service.create.mockResolvedValue(serviceData);

      const result = await repository.create(service);

      expect(result).toBeInstanceOf(Service);
      expect(mockPrismaService.service.create).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should find a service by id', async () => {
      const input = 'service-id';
      mockPrismaService.service.findUnique.mockResolvedValue(serviceData);

      const result = await repository.findById(input);

      expect(result).toBeInstanceOf(Service);
      expect(result?.getId()).toBe(input);
    });

    it('should return null if service not found', async () => {
      const input = 'non-existent-id';
      mockPrismaService.service.findUnique.mockResolvedValue(null);

      const result = await repository.findById(input);

      expect(result).toBeNull();
    });
  });

  describe('findByCategory', () => {
    it('should find services by category', async () => {
      const servicesData = [serviceData];

      mockPrismaService.service.findMany.mockResolvedValue(servicesData);

      const result = await repository.findByCategory(ServiceCategory.MAINTENANCE);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Service);
    });

    it('should return null if service not found', async () => {
      mockPrismaService.service.findMany.mockResolvedValue([]);

      const result = await repository.findByCategory(ServiceCategory.ALIGNMENT);

      expect(result).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('should find all services with pagination', async () => {
      const servicesData = [serviceData];

      mockPrismaService.service.findMany.mockResolvedValue(servicesData);
      mockPrismaService.service.count.mockResolvedValue(1);

      const result = await repository.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should find all services without pagination', async () => {
      const servicesData = [serviceData];

      mockPrismaService.service.findMany.mockResolvedValue(servicesData);
      mockPrismaService.service.count.mockResolvedValue(1);

      const result = await repository.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should find all active services', async () => {
      const servicesData = [serviceData];

      mockPrismaService.service.findMany.mockResolvedValue(servicesData);
      mockPrismaService.service.count.mockResolvedValue(1);

      const result = await repository.findAll({ active: true });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should find all inactive services', async () => {
      const servicesData = [serviceData];

      mockPrismaService.service.findMany.mockResolvedValue(servicesData);
      mockPrismaService.service.count.mockResolvedValue(1);

      const result = await repository.findAll({ active: false });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('update', () => {
    it('should update a service', async () => {
      const updatedData = {
        ...serviceData,
        name: 'Updated Oil Change',
      };

      mockPrismaService.service.update.mockResolvedValue(updatedData);

      const result = await repository.update('service-id', service);

      expect(result).toBeInstanceOf(Service);
      expect(mockPrismaService.service.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a service', async () => {
      const input = 'service-id';
      await repository.delete(input);

      expect(mockPrismaService.service.delete).toHaveBeenCalledWith({
        where: { id: input },
      });
    });
  });
});
