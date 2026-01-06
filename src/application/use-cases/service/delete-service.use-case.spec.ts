import { Test, TestingModule } from '@nestjs/testing';
import { DeleteServiceUseCase } from './delete-service.use-case';
import { ServiceRepositoryPort } from '@application/ports/service.repository.port';
import { NotFoundException } from '@nestjs/common';
import { Service } from '@domain/entities/service.entity';
import { ServiceCategory } from '@prisma/client';

describe('DeleteServiceUseCase', () => {
  let useCase: DeleteServiceUseCase;
  let serviceRepository: jest.Mocked<ServiceRepositoryPort>;

  const mockService = new Service({
    id: '123',
    name: 'Oil Change',
    estimatedDuration: 30,
    price: 150,
    category: ServiceCategory.MAINTENANCE,
  });

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteServiceUseCase,
        {
          provide: ServiceRepositoryPort,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteServiceUseCase>(DeleteServiceUseCase);
    serviceRepository = module.get(ServiceRepositoryPort);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should deactivate service (soft delete)', async () => {
    serviceRepository.findById.mockResolvedValue(mockService);
    serviceRepository.update.mockResolvedValue(mockService);

    await useCase.execute('123');

    expect(serviceRepository.findById).toHaveBeenCalledWith('123');
    expect(serviceRepository.update).toHaveBeenCalledWith('123', expect.any(Service));
  });

  it('should throw NotFoundException when service not found', async () => {
    serviceRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('999')).rejects.toThrow(NotFoundException);
  });
});
