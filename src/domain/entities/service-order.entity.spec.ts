import { ServiceOrderStatus, Priority } from '@prisma/client';

import { ServiceOrder, ServiceOrderProps } from './service-order.entity';
import { InvalidStatusTransitionException } from '@shared/exceptions/invalid-status-transition.exception';

describe('ServiceOrder Entity', () => {
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
  jest.setSystemTime(new Date(2023, 10, 31));

  const validServiceOrderProps: ServiceOrderProps = {
    id: 'service-id',
    orderNumber: 'OS000001',
    customerId: 'customer-123',
    vehicleId: 'vehicle-123',
    description: 'Engine making strange noise',
    createdBy: 'Any Doe',
    createdAt: new Date(),
  };

  describe('Creation', () => {
    it('should create a valid service order', () => {
      const serviceOrder = new ServiceOrder(validServiceOrderProps);

      expect(serviceOrder.getId()).toBe('service-id');
      expect(serviceOrder.getOrderNumber()).toBe('OS000001');
      expect(serviceOrder.getCustomerId()).toBe('customer-123');
      expect(serviceOrder.getVehicleId()).toBe('vehicle-123');
      expect(serviceOrder.getStatus()).toBe(ServiceOrderStatus.RECEIVED);
      expect(serviceOrder.getPriority()).toBe(Priority.NORMAL);
      expect(serviceOrder.getDescription()).toBe('Engine making strange noise');
      expect(serviceOrder.getCreatedBy()).toBe('Any Doe');
      expect(serviceOrder.getCreatedAt()).toEqual(new Date());
    });

    it('should reject service order without customer ID', () => {
      const invalidProps = { ...validServiceOrderProps, customerId: '' };
      expect(() => new ServiceOrder(invalidProps)).toThrow('Customer ID is required');
    });

    it('should reject service order without vehicle ID', () => {
      const invalidProps = { ...validServiceOrderProps, vehicleId: '' };
      expect(() => new ServiceOrder(invalidProps)).toThrow('Vehicle ID is required');
    });

    it('should reject service order with short description', () => {
      const invalidProps = { ...validServiceOrderProps, description: 'Oil' };
      expect(() => new ServiceOrder(invalidProps)).toThrow(
        'Description must have at least 5 characters',
      );
    });

    it('should reject service order with wrong price', () => {
      const invalidProps = { ...validServiceOrderProps, totalAmount: -20 };
      expect(() => new ServiceOrder(invalidProps)).toThrow('Money amount cannot be negative');
    });
  });

  describe('Status Transitions', () => {
    it('should allow valid status transition from RECEIVED to IN_DIAGNOSIS', () => {
      const serviceOrder = new ServiceOrder(validServiceOrderProps);

      expect(() => serviceOrder.updateStatus(ServiceOrderStatus.IN_DIAGNOSIS)).not.toThrow();
      expect(serviceOrder.getStatus()).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
    });

    it('should reject invalid status transition', () => {
      const serviceOrder = new ServiceOrder(validServiceOrderProps);

      expect(() => serviceOrder.updateStatus(ServiceOrderStatus.COMPLETED)).toThrow(
        InvalidStatusTransitionException,
      );
    });

    it('should set completion date when status is COMPLETED', () => {
      const serviceOrder = new ServiceOrder({
        ...validServiceOrderProps,
        status: ServiceOrderStatus.IN_PROGRESS,
      });

      serviceOrder.updateStatus(ServiceOrderStatus.COMPLETED);
      expect(serviceOrder.getActualCompletion()).toBeDefined();
    });
  });

  describe('Approval', () => {
    it('should approve service order in AWAITING_APPROVAL status', () => {
      const serviceOrder = new ServiceOrder({
        ...validServiceOrderProps,
        status: ServiceOrderStatus.AWAITING_APPROVAL,
        totalAmount: 500,
      });

      serviceOrder.approve('customer@example.com');

      expect(serviceOrder.isApproved()).toBe(true);
      expect(serviceOrder.getApprovedBy()).toBe('customer@example.com');
      expect(serviceOrder.getApprovedAt()).toEqual(new Date());
      expect(serviceOrder.getStatus()).toBe(ServiceOrderStatus.APPROVED);
    });

    it('should reject approval if not in AWAITING_APPROVAL status', () => {
      const serviceOrder = new ServiceOrder(validServiceOrderProps);

      expect(() => serviceOrder.approve('customer@example.com')).toThrow(
        'Order must be in AWAITING_APPROVAL status to be approved',
      );
    });

    it('should approve with custom amount', () => {
      const serviceOrder = new ServiceOrder({
        ...validServiceOrderProps,
        status: ServiceOrderStatus.AWAITING_APPROVAL,
        totalAmount: 500,
      });

      serviceOrder.approve('customer@example.com', 450);

      expect(serviceOrder.getApprovedAmount()?.toNumber()).toBe(450);
    });
  });

  describe('Diagnosis', () => {
    it('should update diagnosis', () => {
      const serviceOrder = new ServiceOrder(validServiceOrderProps);

      serviceOrder.updateDiagnosis('This is a test');
      expect(serviceOrder.getDiagnosis()).toBe('This is a test');
    });

    it('should reject negative total amount', () => {
      const serviceOrder = new ServiceOrder(validServiceOrderProps);

      expect(() => serviceOrder.updateTotalAmount(-100)).toThrow('Money amount cannot be negative');
    });
  });

  describe('Total Amount', () => {
    it('should update total amount', () => {
      const serviceOrder = new ServiceOrder(validServiceOrderProps);

      serviceOrder.updateTotalAmount(1000);
      expect(serviceOrder.getTotalAmount().toNumber()).toBe(1000);
    });

    it('should reject negative total amount', () => {
      const serviceOrder = new ServiceOrder(validServiceOrderProps);

      expect(() => serviceOrder.updateTotalAmount(-100)).toThrow('Money amount cannot be negative');
    });
  });

  describe('Assignment', () => {
    it('should assign service order to mechanic', () => {
      const serviceOrder = new ServiceOrder(validServiceOrderProps);

      serviceOrder.assignTo('mechanic-123');
      expect(serviceOrder.getAssignedTo()).toBe('mechanic-123');
    });
  });

  describe('Priority', () => {
    it('should update priority', () => {
      const serviceOrder = new ServiceOrder(validServiceOrderProps);

      serviceOrder.updatePriority(Priority.HIGH);
      expect(serviceOrder.getPriority()).toBe(Priority.HIGH);
    });
  });

  describe('Estimated Completion', () => {
    it('should set estimated completion', () => {
      const serviceOrder = new ServiceOrder(validServiceOrderProps);

      serviceOrder.setEstimatedCompletion(new Date());
      expect(serviceOrder.getEstimatedCompletion()).toEqual(new Date());
      expect(serviceOrder.getUpdatedAt()).toEqual(new Date());
    });
  });

  describe('Observation', () => {
    it('should set new observation', () => {
      const loremIpsum =
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry.';
      const serviceOrder = new ServiceOrder(validServiceOrderProps);

      serviceOrder.addObservation(loremIpsum);

      expect(serviceOrder.getObservations()).toMatch(loremIpsum);
      expect(serviceOrder.getUpdatedAt()).toEqual(new Date());
    });

    it('should concat new observation', () => {
      const loremIpsum =
        "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.";
      const serviceOrder = new ServiceOrder(validServiceOrderProps);

      serviceOrder.addObservation('Existing observation.');
      serviceOrder.addObservation(loremIpsum);

      expect(serviceOrder.getObservations()).toMatch(`Existing observation.\n${loremIpsum}`);
      expect(serviceOrder.getUpdatedAt()).toEqual(new Date());
    });
  });

  describe('Completed', () => {
    it('should return if service is completed for completed status', () => {
      const serviceOrder = new ServiceOrder({
        ...validServiceOrderProps,
        status: ServiceOrderStatus.COMPLETED,
      });

      expect(serviceOrder.isCompleted()).toBe(true);
    });

    it('should return if service is completed for delivered status', () => {
      const serviceOrder = new ServiceOrder({
        ...validServiceOrderProps,
        status: ServiceOrderStatus.DELIVERED,
      });

      expect(serviceOrder.isCompleted()).toBe(true);
    });
  });

  describe('Cancelled', () => {
    it('should return if service is completed for cancelled status', () => {
      const serviceOrder = new ServiceOrder(validServiceOrderProps);
      serviceOrder.updateStatus(ServiceOrderStatus.CANCELLED);

      expect(serviceOrder.isCancelled()).toBe(true);
    });
  });
});
