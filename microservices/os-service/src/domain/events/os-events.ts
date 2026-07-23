import { randomUUID } from 'crypto';
import { ServiceOrder } from '../entities/service-order.entity';
import { DomainEvent } from './domain-event';

export function buildOSCreatedEvent(
  serviceOrder: ServiceOrder,
  correlationId?: string,
): DomainEvent<{ orderNumber?: string; status: string }> {
  return {
    eventId: randomUUID(),
    eventType: 'v1.OSCreated',
    version: 'v1',
    occurredAt: new Date().toISOString(),
    aggregateId: serviceOrder.getId() || '',
    correlationId,
    payload: {
      orderNumber: serviceOrder.getOrderNumber(),
      status: serviceOrder.getStatus(),
    },
  };
}

export function buildOSStatusUpdatedEvent(
  serviceOrder: ServiceOrder,
  correlationId?: string,
): DomainEvent<{ orderNumber?: string; status: string }> {
  return {
    eventId: randomUUID(),
    eventType: 'v1.OSStatusUpdated',
    version: 'v1',
    occurredAt: new Date().toISOString(),
    aggregateId: serviceOrder.getId() || '',
    correlationId,
    payload: {
      orderNumber: serviceOrder.getOrderNumber(),
      status: serviceOrder.getStatus(),
    },
  };
}

export function buildOSCancelledEvent(
  serviceOrder: ServiceOrder,
  correlationId?: string,
): DomainEvent<{ orderNumber?: string; status: string }> {
  return {
    eventId: randomUUID(),
    eventType: 'v1.OSCancelled',
    version: 'v1',
    occurredAt: new Date().toISOString(),
    aggregateId: serviceOrder.getId() || '',
    correlationId,
    payload: {
      orderNumber: serviceOrder.getOrderNumber(),
      status: serviceOrder.getStatus(),
    },
  };
}

