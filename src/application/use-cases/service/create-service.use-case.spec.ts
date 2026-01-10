import { Test, TestingModule } from '@nestjs/testing';
import { ServiceRepositoryPort } from '@application/ports/service.repository.port';
import { Service } from '@domain/entities/service.entity';

import { CreateServiceUseCase } from './create-service.use-case';

describe('CreateServiceUseCase', () => {
  let useCase: CreateServiceUseCase;

  const mockServiceRepository = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateServiceUseCase,
        {
          provide: ServiceRepositoryPort,
          useValue: mockServiceRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateServiceUseCase>(CreateServiceUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a service successfully', async () => {
    const serviceData = {
      name: 'Oil Change',
      description: 'Complete oil change service',
      price: 100.0,
      estimatedDuration: 30,
      category: 'MAINTENANCE' as any,
    };
    const serviceObj = new Service(serviceData);

    mockServiceRepository.create.mockResolvedValue(serviceObj);

    const result = await useCase.execute(serviceData);

    expect(mockServiceRepository.create).toHaveBeenCalled();
    expect(result).toBe(serviceObj);
  });
});
