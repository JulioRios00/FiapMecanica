import { ServiceOrderStatus, Priority } from '@prisma/client';
import { ServiceOrder, ServiceOrderProps } from './service-order.entity';

describe('ServiceOrder Entity', () => {
  const validServiceOrderProps: ServiceOrderProps = {
    customerId: 'customer-123',
    vehicleId: 'vehicle-123',
    description: 'Engine making strange noise',
  };

  describe('Creation', () => {
    it('should create a valid service order', () => {
      const serviceOrder = new ServiceOrder(validServiceOrderProps);
      
      expect(serviceOrder.getCustomerId()).toBe('customer-123');
      expect(serviceOrder.getVehicleId()).toBe('vehicle-123');
      expect(serviceOrder.getStatus()).toBe(ServiceOrderStatus.RECEIVED);
      expect(serviceOrder.getPriority()).toBe(Priority.NORMAL);
    });

    it('should reject service order without customer ID', () => {
      const invalidProps = { ...validServiceOrderProps, customerId: '' };
      expect(() => new ServiceOrder(invalidProps)).toThrow(
        'Customer ID is required',
      );
    });

    it('should reject service order without vehicle ID', () => {
      const invalidProps = { ...validServiceOrderProps, vehicleId: '' };
      expect(() => new ServiceOrder(invalidProps)).toThrow(
        'Vehicle ID is required',
      );
    });

    it('should reject service order with short description', () => {
      const invalidProps = { ...validServiceOrderProps, description: 'Oil' };
      expect(() => new ServiceOrder(invalidProps)).toThrow(
        'Description must have at least 5 characters',
      );
    });
  });

  describe('Status Transitions', () => {
    it('should allow valid status transition from RECEIVED to IN_DIAGNOSIS', () => {
      const serviceOrder = new ServiceOrder(validServiceOrderProps);
      
      expect(() =>
        serviceOrder.updateStatus(ServiceOrderStatus.IN_DIAGNOSIS),
      ).not.toThrow();
      expect(serviceOrder.getStatus()).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
    });

    it('should reject invalid status transition', () => {
      const serviceOrder = new ServiceOrder(validServiceOrderProps);
      
      expect(() =>
        serviceOrder.updateStatus(ServiceOrderStatus.COMPLETED),
      ).toThrow('Invalid status transition');
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

      expect(serviceOrder.getApprovedAmount()).toBe(450);
    });
  });

  describe('Total Amount', () => {
    it('should update total amount', () => {
      const serviceOrder = new ServiceOrder(validServiceOrderProps);
      
      serviceOrder.updateTotalAmount(1000);
      expect(serviceOrder.getTotalAmount()).toBe(1000);
    });

    it('should reject negative total amount', () => {
      const serviceOrder = new ServiceOrder(validServiceOrderProps);
      
      expect(() => serviceOrder.updateTotalAmount(-100)).toThrow(
        'Total amount cannot be negative',
      );
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
});

