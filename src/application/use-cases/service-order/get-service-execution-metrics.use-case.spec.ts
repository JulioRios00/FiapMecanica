import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOrderRepositoryPort } from '@application/ports/service-order.repository.port';

import { GetServiceExecutionMetricsUseCase } from './get-service-execution-metrics.use-case';

describe('GetServiceExecutionMetricsUseCase', () => {
  let useCase: GetServiceExecutionMetricsUseCase;

  const mockServiceOrderRepository = {
    getExecutionMetrics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetServiceExecutionMetricsUseCase,
        {
          provide: ServiceOrderRepositoryPort,
          useValue: mockServiceOrderRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetServiceExecutionMetricsUseCase>(GetServiceExecutionMetricsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get service execution metrics successfully without filters', async () => {
    const mockMetrics = {
      totalServiceOrders: 10,
      completedServiceOrders: 8,
      averageExecutionTimeInHours: 2.5,
      servicesByStatus: [
        { status: 'PENDING', count: 2 },
        { status: 'IN_PROGRESS', count: 0 },
        { status: 'COMPLETED', count: 8 },
      ],
    };

    mockServiceOrderRepository.getExecutionMetrics.mockResolvedValue(mockMetrics);

    const result = await useCase.execute();

    expect(mockServiceOrderRepository.getExecutionMetrics).toHaveBeenCalledWith(undefined);
    expect(result).toEqual({ ...mockMetrics, averageExecutionTimeFormatted: '2h 30min' });
  });

  it('should get service execution metrics successfully with filters', async () => {
    const filters = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
    };

    const mockMetrics = {
      totalServiceOrders: 5,
      completedServiceOrders: 4,
      averageExecutionTimeInHours: 1.75,
      servicesByStatus: [
        { status: 'PENDING', count: 1 },
        { status: 'COMPLETED', count: 4 },
      ],
    };

    mockServiceOrderRepository.getExecutionMetrics.mockResolvedValue(mockMetrics);

    const result = await useCase.execute(filters);

    expect(mockServiceOrderRepository.getExecutionMetrics).toHaveBeenCalledWith(filters);
    expect(result).toEqual({ ...mockMetrics, averageExecutionTimeFormatted: '1h 45min' });
  });

  it('should format time correctly when hours is 0', async () => {
    const mockMetrics = {
      totalServiceOrders: 3,
      completedServiceOrders: 3,
      averageExecutionTimeInHours: 0.5,
      servicesByStatus: [{ status: 'COMPLETED', count: 3 }],
    };

    mockServiceOrderRepository.getExecutionMetrics.mockResolvedValue(mockMetrics);

    const result = await useCase.execute();

    expect(result.averageExecutionTimeFormatted).toBe('30 minutes');
  });
});
