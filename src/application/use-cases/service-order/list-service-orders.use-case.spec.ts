import { Test, TestingModule } from '@nestjs/testing';
import { ListServiceOrdersUseCase } from './list-service-orders.use-case';
import { ServiceOrderRepositoryPort } from '@application/ports/service-order.repository.port';
import { ServiceOrder } from '@domain/entities/service-order.entity';
import { ServiceOrderStatus } from '@prisma/client';

describe('ListServiceOrdersUseCase', () => {
  let useCase: ListServiceOrdersUseCase;
  let serviceOrderRepository: jest.Mocked<ServiceOrderRepositoryPort>;

  const mockServiceOrders = [
    new ServiceOrder({
      id: '1',
      orderNumber: 'OS-001',
      customerId: 'customer-1',
      vehicleId: 'vehicle-1',
      status: ServiceOrderStatus.RECEIVED,
      description: 'Oil change',
      totalAmount: 150,
    }),
    new ServiceOrder({
      id: '2',
      orderNumber: 'OS-002',
      customerId: 'customer-2',
      vehicleId: 'vehicle-2',
      status: ServiceOrderStatus.IN_PROGRESS,
      description: 'Brake repair',
      totalAmount: 500,
    }),
  ];

  beforeEach(async () => {
    const mockRepository = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListServiceOrdersUseCase,
        {
          provide: ServiceOrderRepositoryPort,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<ListServiceOrdersUseCase>(ListServiceOrdersUseCase);
    serviceOrderRepository = module.get(ServiceOrderRepositoryPort);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return all service orders', async () => {
    const paginatedResult = {
      data: mockServiceOrders,
      total: mockServiceOrders.length,
      page: 1,
      limit: 10,
    };
    serviceOrderRepository.findAll.mockResolvedValue(paginatedResult);

    const result = await useCase.execute();

    expect(result).toEqual(paginatedResult);
    expect(serviceOrderRepository.findAll).toHaveBeenCalledWith(undefined);
  });

  it('should return service orders filtered by status', async () => {
    const filtered = [mockServiceOrders[0]];
    const paginatedResult = {
      data: filtered,
      total: filtered.length,
      page: 1,
      limit: 10,
    };
    serviceOrderRepository.findAll.mockResolvedValue(paginatedResult);

    const result = await useCase.execute({ status: 'RECEIVED' });

    expect(result).toEqual(paginatedResult);
    expect(serviceOrderRepository.findAll).toHaveBeenCalledWith({ status: 'RECEIVED' });
  });
});
