import { Test, TestingModule } from '@nestjs/testing';
import { Part } from '@domain/entities/part.entity';

import { PrismaService } from '../database/prisma.service';
import { PartRepository } from './part.repository';

const part = new Part({
  name: 'Brake Pad',
  partNumber: 'BP-001',
  description: 'Front brake pad',
  price: 150.0,
  stockQuantity: 10,
  minStockLevel: 5,
});

const partData = {
  id: 'part-id',
  name: 'Brake Pad',
  partNumber: 'BP-001',
  description: 'Front brake pad',
  manufacturer: null,
  price: 150.0,
  stockQuantity: 10,
  minStockLevel: 5,
  unit: 'UNIT',
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('PartRepository', () => {
  let repository: PartRepository;

  const mockPrismaService = {
    part: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      fields: {
        minStockLevel: 'minStockLevel',
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PartRepository>(PartRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a part', async () => {
      mockPrismaService.part.create.mockResolvedValue(partData);

      const result = await repository.create(part);

      expect(result).toBeInstanceOf(Part);
      expect(mockPrismaService.part.create).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should find a part by id', async () => {
      const input = 'part-id';
      mockPrismaService.part.findUnique.mockResolvedValue(partData);

      const result = await repository.findById(input);

      expect(result).toBeInstanceOf(Part);
      expect(result?.getId()).toBe(input);
    });

    it('should return null if part not found', async () => {
      const input = 'non-existent-id';
      mockPrismaService.part.findUnique.mockResolvedValue(null);

      const result = await repository.findById(input);

      expect(result).toBeNull();
    });
  });

  describe('findByPartNumber', () => {
    it('should find a part by part number', async () => {
      const input = 'BP-001';
      mockPrismaService.part.findUnique.mockResolvedValue(partData);

      const result = await repository.findByPartNumber(input);

      expect(result).toBeInstanceOf(Part);
    });

    it('should return null if part not found', async () => {
      const input = 'BP-002';
      mockPrismaService.part.findUnique.mockResolvedValue(null);

      const result = await repository.findByPartNumber(input);

      expect(result).toBeNull();
    });
  });

  describe('findLowStock', () => {
    it('should find parts with low stock', async () => {
      const partsData = [partData];

      mockPrismaService.part.findMany.mockResolvedValue(partsData);

      const result = await repository.findLowStock();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Part);
    });
  });

  describe('findAll', () => {
    it('should find all parts with pagination', async () => {
      const partsData = [partData];

      mockPrismaService.part.findMany.mockResolvedValue(partsData);
      mockPrismaService.part.count.mockResolvedValue(1);

      const result = await repository.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should find all parts without pagination', async () => {
      const partsData = [partData];

      mockPrismaService.part.findMany.mockResolvedValue(partsData);
      mockPrismaService.part.count.mockResolvedValue(1);

      const result = await repository.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should find all parts without pagination', async () => {
      const partsData = [partData];

      mockPrismaService.part.findMany.mockResolvedValue(partsData);
      mockPrismaService.part.count.mockResolvedValue(1);

      const result = await repository.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  it('should find all active parts', async () => {
    const partsData = [partData];

    mockPrismaService.part.findMany.mockResolvedValue(partsData);
    mockPrismaService.part.count.mockResolvedValue(1);

    const result = await repository.findAll({ active: true });

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should find all inactive parts', async () => {
    const partsData = [partData];

    mockPrismaService.part.findMany.mockResolvedValue(partsData);
    mockPrismaService.part.count.mockResolvedValue(1);

    const result = await repository.findAll({ active: false });

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  describe('update', () => {
    it('should update a part', async () => {
      const updatedData = {
        ...partData,
        name: 'Updated Brake Pad',
      };

      mockPrismaService.part.update.mockResolvedValue(updatedData);

      const result = await repository.update('part-id', part);

      expect(result).toBeInstanceOf(Part);
      expect(mockPrismaService.part.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a part', async () => {
      await repository.delete('part-id');

      expect(mockPrismaService.part.delete).toHaveBeenCalledWith({
        where: { id: 'part-id' },
      });
    });
  });
});
