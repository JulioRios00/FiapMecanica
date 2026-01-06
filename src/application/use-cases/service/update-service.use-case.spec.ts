import { Test, TestingModule } from '@nestjs/testing';
import { UpdateServiceUseCase } from './update-service.use-case';
import { ServiceRepositoryPort } from '@application/ports/service.repository.port';
import { NotFoundException } from '@nestjs/common';
import { Service } from '@domain/entities/service.entity';
import { ServiceCategory } from '@prisma/client';

describe('UpdateServiceUseCase', () => {
  let useCase: UpdateServiceUseCase;
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
        UpdateServiceUseCase,
        {
          provide: ServiceRepositoryPort,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateServiceUseCase>(UpdateServiceUseCase);
    serviceRepository = module.get(ServiceRepositoryPort);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update service information', async () => {
    serviceRepository.findById.mockResolvedValue(mockService);
    serviceRepository.update.mockResolvedValue(mockService);

    const updateData = { name: 'Premium Oil Change', price: 200 };
    const result = await useCase.execute('123', updateData);

    expect(serviceRepository.findById).toHaveBeenCalledWith('123');
    expect(serviceRepository.update).toHaveBeenCalledWith('123', expect.any(Service));
    expect(result).toBeDefined();
  });

  it('should throw NotFoundException when service not found', async () => {
    serviceRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('999', { price: 200 })).rejects.toThrow(NotFoundException);
  });
});
