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
      createdAt: new Date('2024-01-01'),
    }),
    new ServiceOrder({
      id: '2',
      orderNumber: 'OS-002',
      customerId: 'customer-2',
      vehicleId: 'vehicle-2',
      status: ServiceOrderStatus.IN_PROGRESS,
      description: 'Brake repair',
      totalAmount: 500,
      createdAt: new Date('2024-01-02'),
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

  it('should return all service orders with excludeCompleted defaulting to true', async () => {
    const paginatedResult = {
      data: [...mockServiceOrders],
      total: mockServiceOrders.length,
      page: 1,
      limit: 10,
    };
    serviceOrderRepository.findAll.mockResolvedValue(paginatedResult);

    const result = await useCase.execute();

    expect(serviceOrderRepository.findAll).toHaveBeenCalledWith({
      excludeCompleted: true,
    });
    expect(result.data).toBeDefined();
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

    const result = await useCase.execute({ status: ServiceOrderStatus.RECEIVED });

    expect(result).toEqual(paginatedResult);
    expect(serviceOrderRepository.findAll).toHaveBeenCalledWith({
      status: ServiceOrderStatus.RECEIVED,
      excludeCompleted: true,
    });
  });

  it('should sort results by status priority (IN_PROGRESS before RECEIVED)', async () => {
    const unordered = [
      new ServiceOrder({
        id: '1',
        customerId: 'c1',
        vehicleId: 'v1',
        status: ServiceOrderStatus.RECEIVED,
        description: 'Order A - received',
        createdAt: new Date('2024-01-01'),
      }),
      new ServiceOrder({
        id: '2',
        customerId: 'c2',
        vehicleId: 'v2',
        status: ServiceOrderStatus.IN_PROGRESS,
        description: 'Order B - in progress',
        createdAt: new Date('2024-01-02'),
      }),
      new ServiceOrder({
        id: '3',
        customerId: 'c3',
        vehicleId: 'v3',
        status: ServiceOrderStatus.AWAITING_APPROVAL,
        description: 'Order C - awaiting approval',
        createdAt: new Date('2024-01-03'),
      }),
    ];

    serviceOrderRepository.findAll.mockResolvedValue({
      data: unordered,
      total: 3,
      page: 1,
      limit: 10,
    });

    const result = await useCase.execute();

    expect(result.data[0].getStatus()).toBe(ServiceOrderStatus.IN_PROGRESS);
    expect(result.data[1].getStatus()).toBe(ServiceOrderStatus.AWAITING_APPROVAL);
    expect(result.data[2].getStatus()).toBe(ServiceOrderStatus.RECEIVED);
  });

  it('should sort by createdAt ascending within same status priority', async () => {
    const sameStatus = [
      new ServiceOrder({
        id: '2',
        customerId: 'c2',
        vehicleId: 'v2',
        status: ServiceOrderStatus.IN_PROGRESS,
        description: 'Newer order in progress',
        createdAt: new Date('2024-02-01'),
      }),
      new ServiceOrder({
        id: '1',
        customerId: 'c1',
        vehicleId: 'v1',
        status: ServiceOrderStatus.IN_PROGRESS,
        description: 'Older order in progress',
        createdAt: new Date('2024-01-01'),
      }),
    ];

    serviceOrderRepository.findAll.mockResolvedValue({
      data: sameStatus,
      total: 2,
      page: 1,
      limit: 10,
    });

    const result = await useCase.execute();

    expect(result.data[0].getId()).toBe('1');
    expect(result.data[1].getId()).toBe('2');
  });

  it('should allow excludeCompleted to be set to false', async () => {
    const paginatedResult = {
      data: [...mockServiceOrders],
      total: mockServiceOrders.length,
      page: 1,
      limit: 10,
    };
    serviceOrderRepository.findAll.mockResolvedValue(paginatedResult);

    await useCase.execute({ excludeCompleted: false });

    expect(serviceOrderRepository.findAll).toHaveBeenCalledWith({
      excludeCompleted: false,
    });
  });
});
