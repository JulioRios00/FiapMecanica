import { ServiceOrder } from '../entities/service-order.entity';
import {
  buildOSCancelledEvent,
  buildOSCreatedEvent,
  buildOSStatusUpdatedEvent,
} from './os-events';

describe('os-events builders', () => {
  const order = new ServiceOrder({
    id: 'os-1',
    orderNumber: 'OS-0001',
    description: 'Replace brake pads',
    status: 'OPEN',
  });

  describe('buildOSCreatedEvent', () => {
    it('builds a v1.OSCreated event from the service order', () => {
      const event = buildOSCreatedEvent(order, 'corr-1');

      expect(event.eventType).toBe('v1.OSCreated');
      expect(event.version).toBe('v1');
      expect(event.aggregateId).toBe('os-1');
      expect(event.correlationId).toBe('corr-1');
      expect(event.payload).toEqual({ orderNumber: 'OS-0001', status: 'OPEN' });
      expect(event.eventId).toBeDefined();
      expect(event.occurredAt).toBeDefined();
    });

    it('falls back to an empty aggregateId when the order has none', () => {
      const orderWithoutId = new ServiceOrder({ description: 'Replace brake pads' });

      const event = buildOSCreatedEvent(orderWithoutId);

      expect(event.aggregateId).toBe('');
      expect(event.correlationId).toBeUndefined();
    });
  });

  describe('buildOSStatusUpdatedEvent', () => {
    it('builds a v1.OSStatusUpdated event reflecting the current status', () => {
      const updated = new ServiceOrder({
        id: 'os-1',
        orderNumber: 'OS-0001',
        description: 'Replace brake pads',
        status: 'AWAITING_QUOTE',
      });

      const event = buildOSStatusUpdatedEvent(updated, 'corr-2');

      expect(event.eventType).toBe('v1.OSStatusUpdated');
      expect(event.payload).toEqual({ orderNumber: 'OS-0001', status: 'AWAITING_QUOTE' });
      expect(event.correlationId).toBe('corr-2');
    });
  });

  describe('buildOSCancelledEvent', () => {
    it('builds a v1.OSCancelled event', () => {
      const cancelled = new ServiceOrder({
        id: 'os-1',
        orderNumber: 'OS-0001',
        description: 'Replace brake pads',
        status: 'IN_EXECUTION',
      });
      cancelled.forceCancel();

      const event = buildOSCancelledEvent(cancelled);

      expect(event.eventType).toBe('v1.OSCancelled');
      expect(event.payload).toEqual({ orderNumber: 'OS-0001', status: 'CANCELLED' });
    });
  });
});
