import { UpdateServiceUseCase } from '@application/use-cases/service/update-service.use-case';
import { Test, TestingModule } from '@nestjs/testing';
import { ServiceCategory } from '@prisma/client';
import { Service } from '@domain/entities/service.entity';
import { ListServicesUseCase } from '@application/use-cases/service/list-services.use-case';
import { GetServiceUseCase } from '@application/use-cases/service/get-service.use-case';
import { DeleteServiceUseCase } from '@application/use-cases/service/delete-service.use-case';
import { CreateServiceUseCase } from '@application/use-cases/service/create-service.use-case';

import { ServiceController } from './service.controller';

const serviceDto = {
  name: 'Oil Change',
  description: 'Complete oil change service',
  price: 100.0,
  estimatedDuration: 30,
  category: ServiceCategory.MAINTENANCE,
};

const service = new Service({
  id: 'service-1',
  ...serviceDto,
});

describe('ServiceController', () => {
  let controller: ServiceController;

  const mockCreateServiceUseCase = {
    execute: jest.fn(),
  };

  const mockGetServiceUseCase = {
    execute: jest.fn(),
  };

  const mockListServicesUseCase = {
    execute: jest.fn(),
  };

  const mockUpdateServiceUseCase = {
    execute: jest.fn(),
  };

  const mockDeleteServiceUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceController],
      providers: [
        {
          provide: CreateServiceUseCase,
          useValue: mockCreateServiceUseCase,
        },
        {
          provide: GetServiceUseCase,
          useValue: mockGetServiceUseCase,
        },
        {
          provide: ListServicesUseCase,
          useValue: mockListServicesUseCase,
        },
        {
          provide: UpdateServiceUseCase,
          useValue: mockUpdateServiceUseCase,
        },
        {
          provide: DeleteServiceUseCase,
          useValue: mockDeleteServiceUseCase,
        },
      ],
    }).compile();

    controller = module.get<ServiceController>(ServiceController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a service', async () => {
      mockCreateServiceUseCase.execute.mockResolvedValue(service);

      const result = await controller.create(serviceDto);

      expect(result).toEqual(service);
      expect(mockCreateServiceUseCase.execute).toHaveBeenCalledWith(serviceDto);
    });
  });

  describe('findAll', () => {
    it('should list services without filters', async () => {
      mockListServicesUseCase.execute.mockResolvedValue([service]);

      const result = await controller.findAll();

      expect(result).toEqual([service]);
      expect(mockListServicesUseCase.execute).toHaveBeenCalledWith({});
    });

    it('should list services with filters', async () => {
      mockListServicesUseCase.execute.mockResolvedValue([service]);

      const result = await controller.findAll('MAINTENANCE', 'true');

      expect(result).toEqual([service]);
      expect(mockListServicesUseCase.execute).toHaveBeenCalledWith({
        category: 'MAINTENANCE',
        active: true,
      });
    });
  });

  describe('findOne', () => {
    it('should get a service by id', async () => {
      mockGetServiceUseCase.execute.mockResolvedValue(service);

      const result = await controller.findOne('service-id');

      expect(result).toEqual(service);
      expect(mockGetServiceUseCase.execute).toHaveBeenCalledWith('service-id');
    });
  });

  describe('update', () => {
    it('should update a service', async () => {
      const updateDto = {
        name: 'Updated Oil Change',
      };

      mockUpdateServiceUseCase.execute.mockResolvedValue(service);

      const result = await controller.update('service-id', updateDto);

      expect(result).toEqual(service);
      expect(mockUpdateServiceUseCase.execute).toHaveBeenCalledWith('service-id', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a service', async () => {
      await controller.remove('service-id');

      expect(mockDeleteServiceUseCase.execute).toHaveBeenCalledWith('service-id');
    });
  });
});
