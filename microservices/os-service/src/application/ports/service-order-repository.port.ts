import { ServiceOrder, ServiceOrderStatus } from '../../domain/entities/service-order.entity';

export interface ServiceOrderHistoryEntry {
  previousStatus?: ServiceOrderStatus;
  newStatus: ServiceOrderStatus;
  reason?: string;
  createdAt: Date;
}

export abstract class ServiceOrderRepositoryPort {
  abstract create(order: ServiceOrder): Promise<ServiceOrder>;
  abstract findById(id: string): Promise<ServiceOrder | null>;
  abstract updateStatus(id: string, status: ServiceOrderStatus, reason?: string): Promise<ServiceOrder>;
  abstract listHistory(serviceOrderId: string): Promise<ServiceOrderHistoryEntry[]>;
}

