import { Test, TestingModule } from '@nestjs/testing';
import { UpdatePartUseCase } from './update-part.use-case';
import { PartRepositoryPort } from '@application/ports/part.repository.port';
import { NotFoundException } from '@nestjs/common';
import { Part } from '@domain/entities/part.entity';

describe('UpdatePartUseCase', () => {
  let useCase: UpdatePartUseCase;
  let partRepository: jest.Mocked<PartRepositoryPort>;

  const mockPart = new Part({
    id: '123',
    name: 'Oil Filter',
    partNumber: 'OF-12345',
    price: 45.5,
    stockQuantity: 100,
  });

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePartUseCase,
        {
          provide: PartRepositoryPort,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdatePartUseCase>(UpdatePartUseCase);
    partRepository = module.get(PartRepositoryPort);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update part information', async () => {
    partRepository.findById.mockResolvedValue(mockPart);
    partRepository.update.mockResolvedValue(mockPart);

    const updateData = { name: 'Premium Oil Filter', price: 55 };
    const result = await useCase.execute('123', updateData);

    expect(partRepository.findById).toHaveBeenCalledWith('123');
    expect(partRepository.update).toHaveBeenCalledWith('123', expect.any(Part));
    expect(result).toBeDefined();
  });

  it('should throw NotFoundException when part not found', async () => {
    partRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('999', { price: 60 })).rejects.toThrow(NotFoundException);
  });
});
