import { Test, TestingModule } from '@nestjs/testing';
import { GetPartUseCase } from './get-part.use-case';
import { PartRepositoryPort } from '@application/ports/part.repository.port';
import { NotFoundException } from '@nestjs/common';
import { Part } from '@domain/entities/part.entity';

describe('GetPartUseCase', () => {
  let useCase: GetPartUseCase;
  let partRepository: jest.Mocked<PartRepositoryPort>;

  const mockPart = new Part({
    id: '123',
    name: 'Oil Filter',
    partNumber: 'OF-12345',
    price: 45.5,
    stockQuantity: 100,
    active: true,
  });

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPartUseCase,
        {
          provide: PartRepositoryPort,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetPartUseCase>(GetPartUseCase);
    partRepository = module.get(PartRepositoryPort);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return a part when found', async () => {
    partRepository.findById.mockResolvedValue(mockPart);

    const result = await useCase.execute('123');

    expect(result).toEqual(mockPart);
    expect(partRepository.findById).toHaveBeenCalledWith('123');
  });

  it('should throw NotFoundException when part not found', async () => {
    partRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('999')).rejects.toThrow(NotFoundException);
  });
});
