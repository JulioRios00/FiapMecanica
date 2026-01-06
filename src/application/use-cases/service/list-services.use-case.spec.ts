import { Test, TestingModule } from '@nestjs/testing';
import { ListServicesUseCase } from './list-services.use-case';
import { ServiceRepositoryPort } from '@application/ports/service.repository.port';
import { Service } from '@domain/entities/service.entity';
import { ServiceCategory } from '@prisma/client';

describe('ListServicesUseCase', () => {
  let useCase: ListServicesUseCase;
  let serviceRepository: jest.Mocked<ServiceRepositoryPort>;

  const mockServices = [
    new Service({
      id: '1',
      name: 'Oil Change',
      estimatedDuration: 30,
      price: 150,
      category: ServiceCategory.MAINTENANCE,
      active: true,
    }),
    new Service({
      id: '2',
      name: 'Brake Inspection',
      estimatedDuration: 45,
      price: 200,
      category: ServiceCategory.INSPECTION,
      active: true,
    }),
  ];

  beforeEach(async () => {
    const mockRepository = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListServicesUseCase,
        {
          provide: ServiceRepositoryPort,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<ListServicesUseCase>(ListServicesUseCase);
    serviceRepository = module.get(ServiceRepositoryPort);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return all services', async () => {
    const paginatedResult = {
      data: mockServices,
      total: mockServices.length,
      page: 1,
      limit: 10,
    };
    serviceRepository.findAll.mockResolvedValue(paginatedResult);

    const result = await useCase.execute();

    expect(result).toEqual(paginatedResult);
    expect(serviceRepository.findAll).toHaveBeenCalledWith(undefined);
  });

  it('should return services filtered by category', async () => {
    const filtered = [mockServices[0]];
    const paginatedResult = {
      data: filtered,
      total: filtered.length,
      page: 1,
      limit: 10,
    };
    serviceRepository.findAll.mockResolvedValue(paginatedResult);

    const result = await useCase.execute({ category: 'MAINTENANCE' });

    expect(result).toEqual(paginatedResult);
    expect(serviceRepository.findAll).toHaveBeenCalledWith({ category: 'MAINTENANCE' });
  });
});
