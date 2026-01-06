import { Test, TestingModule } from '@nestjs/testing';
import { GetServiceUseCase } from './get-service.use-case';
import { ServiceRepositoryPort } from '@application/ports/service.repository.port';
import { NotFoundException } from '@nestjs/common';
import { Service } from '@domain/entities/service.entity';
import { ServiceCategory } from '@prisma/client';

describe('GetServiceUseCase', () => {
  let useCase: GetServiceUseCase;
  let serviceRepository: jest.Mocked<ServiceRepositoryPort>;

  const mockService = new Service({
    id: '123',
    name: 'Oil Change',
    estimatedDuration: 30,
    price: 150,
    category: ServiceCategory.MAINTENANCE,
    active: true,
  });

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetServiceUseCase,
        {
          provide: ServiceRepositoryPort,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetServiceUseCase>(GetServiceUseCase);
    serviceRepository = module.get(ServiceRepositoryPort);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return a service when found', async () => {
    serviceRepository.findById.mockResolvedValue(mockService);

    const result = await useCase.execute('123');

    expect(result).toEqual(mockService);
    expect(serviceRepository.findById).toHaveBeenCalledWith('123');
  });

  it('should throw NotFoundException when service not found', async () => {
    serviceRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('999')).rejects.toThrow(NotFoundException);
  });
});
