import { Test, TestingModule } from '@nestjs/testing';
import { DeletePartUseCase } from './delete-part.use-case';
import { PartRepositoryPort } from '@application/ports/part.repository.port';
import { NotFoundException } from '@nestjs/common';
import { Part } from '@domain/entities/part.entity';

describe('DeletePartUseCase', () => {
  let useCase: DeletePartUseCase;
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
        DeletePartUseCase,
        {
          provide: PartRepositoryPort,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeletePartUseCase>(DeletePartUseCase);
    partRepository = module.get(PartRepositoryPort);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should deactivate part (soft delete)', async () => {
    partRepository.findById.mockResolvedValue(mockPart);
    partRepository.update.mockResolvedValue(mockPart);

    await useCase.execute('123');

    expect(partRepository.findById).toHaveBeenCalledWith('123');
    expect(partRepository.update).toHaveBeenCalledWith('123', expect.any(Part));
  });

  it('should throw NotFoundException when part not found', async () => {
    partRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('999')).rejects.toThrow(NotFoundException);
  });
});
