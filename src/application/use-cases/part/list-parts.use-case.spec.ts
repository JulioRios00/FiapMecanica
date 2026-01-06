import { Test, TestingModule } from '@nestjs/testing';
import { ListPartsUseCase } from './list-parts.use-case';
import { PartRepositoryPort } from '@application/ports/part.repository.port';
import { Part } from '@domain/entities/part.entity';

describe('ListPartsUseCase', () => {
  let useCase: ListPartsUseCase;
  let partRepository: jest.Mocked<PartRepositoryPort>;

  const mockParts = [
    new Part({
      id: '1',
      name: 'Oil Filter',
      partNumber: 'OF-001',
      price: 45.5,
      stockQuantity: 100,
      active: true,
    }),
    new Part({
      id: '2',
      name: 'Air Filter',
      partNumber: 'AF-002',
      price: 35.0,
      stockQuantity: 5,
      active: true,
    }),
  ];

  beforeEach(async () => {
    const mockRepository = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListPartsUseCase,
        {
          provide: PartRepositoryPort,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<ListPartsUseCase>(ListPartsUseCase);
    partRepository = module.get(PartRepositoryPort);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return all parts', async () => {
    const paginatedResult = {
      data: mockParts,
      total: mockParts.length,
      page: 1,
      limit: 10,
    };
    partRepository.findAll.mockResolvedValue(paginatedResult);

    const result = await useCase.execute();

    expect(result).toEqual(paginatedResult);
    expect(partRepository.findAll).toHaveBeenCalledWith(undefined);
  });

  it('should return parts filtered by lowStock', async () => {
    const filtered = [mockParts[1]];
    const paginatedResult = {
      data: filtered,
      total: filtered.length,
      page: 1,
      limit: 10,
    };
    partRepository.findAll.mockResolvedValue(paginatedResult);

    const result = await useCase.execute({ lowStock: true });

    expect(result).toEqual(paginatedResult);
    expect(partRepository.findAll).toHaveBeenCalledWith({ lowStock: true });
  });
});
