import { ServiceOrder } from './service-order.entity';

describe('ServiceOrder', () => {
  describe('constructor', () => {
    it('defaults status to OPEN when not provided', () => {
      const order = new ServiceOrder({ description: 'Replace brake pads' });

      expect(order.getStatus()).toBe('OPEN');
    });

    it('accepts an explicit initial status', () => {
      const order = new ServiceOrder({
        description: 'Replace brake pads',
        status: 'AWAITING_QUOTE',
      });

      expect(order.getStatus()).toBe('AWAITING_QUOTE');
    });

    it.each(['', '   ', 'abcd'])(
      'rejects a description that is too short ("%s")',
      (description) => {
        expect(() => new ServiceOrder({ description })).toThrow(
          'Description must have at least 5 characters',
        );
      },
    );
  });

  describe('updateStatus', () => {
    it('allows a valid transition', () => {
      const order = new ServiceOrder({ description: 'Replace brake pads' });

      order.updateStatus('AWAITING_QUOTE');

      expect(order.getStatus()).toBe('AWAITING_QUOTE');
    });

    it('rejects an invalid transition', () => {
      const order = new ServiceOrder({ description: 'Replace brake pads' });

      expect(() => order.updateStatus('IN_EXECUTION')).toThrow(
        'Invalid status transition: OPEN -> IN_EXECUTION',
      );
    });

    it('rejects any transition once COMPLETED', () => {
      const order = new ServiceOrder({
        description: 'Replace brake pads',
        status: 'IN_EXECUTION',
      });

      order.updateStatus('COMPLETED');

      expect(() => order.updateStatus('CANCELLED')).toThrow(
        'Invalid status transition: COMPLETED -> CANCELLED',
      );
    });
  });

  describe('forceCancel', () => {
    it('cancels an order regardless of current status', () => {
      const order = new ServiceOrder({
        description: 'Replace brake pads',
        status: 'IN_EXECUTION',
      });

      order.forceCancel();

      expect(order.getStatus()).toBe('CANCELLED');
    });

    it('refuses to cancel a completed order', () => {
      const order = new ServiceOrder({
        description: 'Replace brake pads',
        status: 'IN_EXECUTION',
      });
      order.updateStatus('COMPLETED');

      expect(() => order.forceCancel()).toThrow(
        'Cannot cancel a completed service order',
      );
    });
  });

  describe('toJSON', () => {
    it('serializes all fields', () => {
      const createdAt = new Date('2026-01-01T00:00:00.000Z');
      const order = new ServiceOrder({
        id: 'os-1',
        orderNumber: 'OS-0001',
        description: 'Replace brake pads',
        status: 'OPEN',
        createdAt,
      });

      expect(order.toJSON()).toEqual({
        id: 'os-1',
        orderNumber: 'OS-0001',
        description: 'Replace brake pads',
        status: 'OPEN',
        createdAt,
        updatedAt: undefined,
      });
    });
  });
});
