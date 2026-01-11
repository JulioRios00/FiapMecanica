import { Test, TestingModule } from '@nestjs/testing';
import { PartRepositoryPort } from '@application/ports/part.repository.port';
import { Part } from '@domain/entities/part.entity';
import { ConflictException } from '@nestjs/common';

import { CreatePartUseCase } from './create-part.use-case';

describe('CreatePartUseCase', () => {
  let useCase: CreatePartUseCase;

  const mockPartRepository = {
    create: jest.fn(),
    findByPartNumber: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePartUseCase,
        {
          provide: PartRepositoryPort,
          useValue: mockPartRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreatePartUseCase>(CreatePartUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a part successfully', async () => {
    const partData = {
      name: 'Brake Pad',
      partNumber: 'BP-001',
      description: 'Front brake pad',
      price: 150.0,
      stockQuantity: 10,
      minStockLevel: 5,
    };
    const partObj = new Part(partData);

    mockPartRepository.findByPartNumber.mockResolvedValue(null);
    mockPartRepository.create.mockResolvedValue(partObj);

    const result = await useCase.execute(partData);

    expect(mockPartRepository.findByPartNumber).toHaveBeenCalledWith(partData.partNumber);
    expect(mockPartRepository.create).toHaveBeenCalled();
    expect(result).toBe(partObj);
  });

  it('should throw ConflictException if part number already exists', async () => {
    const partData = {
      name: 'Brake Pad',
      partNumber: 'BP-001',
      description: 'Front brake pad',
      price: 150.0,
      stockQuantity: 10,
      minStockLevel: 5,
    };

    mockPartRepository.findByPartNumber.mockResolvedValue(partData);

    await expect(useCase.execute(partData)).rejects.toThrow(
      new ConflictException('Part with this part number already exists'),
    );
    expect(mockPartRepository.findByPartNumber).toHaveBeenCalledWith(partData.partNumber);
    expect(mockPartRepository.create).not.toHaveBeenCalled();
  });
});
