import { Injectable } from '@nestjs/common';
import { ServiceOrderRepositoryPort } from '@application/ports/service-order.repository.port';

export interface ServiceExecutionMetrics {
  totalServiceOrders: number;
  completedServiceOrders: number;
  averageExecutionTimeInHours: number;
  averageExecutionTimeFormatted: string;
  servicesByStatus: {
    status: string;
    count: number;
  }[];
  executionTimeByService?: {
    serviceName: string;
    averageTimeInHours: number;
    count: number;
  }[];
}

@Injectable()
export class GetServiceExecutionMetricsUseCase {
  constructor(private readonly serviceOrderRepository: ServiceOrderRepositoryPort) {}

  async execute(filters?: { startDate?: Date; endDate?: Date }): Promise<ServiceExecutionMetrics> {
    const metrics = await this.serviceOrderRepository.getExecutionMetrics(filters);

    const hours = Math.floor(metrics.averageExecutionTimeInHours);
    const minutes = Math.round((metrics.averageExecutionTimeInHours - hours) * 60);
    const formatted = hours > 0 ? `${hours}h ${minutes}min` : `${minutes} minutes`;

    return {
      ...metrics,
      averageExecutionTimeFormatted: formatted,
    };
  }
}
