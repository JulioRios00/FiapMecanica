import { Service, ServiceProps } from './service.entity';
import { ServiceCategory } from '@prisma/client';

describe('Service Entity', () => {
  const validServiceProps: ServiceProps = {
    name: 'Oil Change',
    description: 'Complete oil and filter change',
    estimatedDuration: 30,
    price: 150.0,
    category: ServiceCategory.MAINTENANCE,
  };

  describe('Constructor', () => {
    it('should create a valid service', () => {
      const service = new Service(validServiceProps);
      expect(service).toBeDefined();
      expect(service.getName()).toBe('Oil Change');
      expect(service.getEstimatedDuration()).toBe(30);
      expect(service.getPrice()).toBe(150.0);
      expect(service.getCategory()).toBe(ServiceCategory.MAINTENANCE);
      expect(service.isActive()).toBe(true);
    });

    it('should accept optional description', () => {
      const serviceWithoutDesc = new Service({
        name: 'Quick Check',
        estimatedDuration: 15,
        price: 50,
        category: ServiceCategory.INSPECTION,
      });
      expect(serviceWithoutDesc.getDescription()).toBeUndefined();
    });

    it('should default active to true', () => {
      const service = new Service(validServiceProps);
      expect(service.isActive()).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should reject name with less than 3 characters', () => {
      expect(
        () =>
          new Service({
            ...validServiceProps,
            name: 'AB',
          }),
      ).toThrow('Service name must have at least 3 characters');
    });

    it('should reject empty name', () => {
      expect(
        () =>
          new Service({
            ...validServiceProps,
            name: '',
          }),
      ).toThrow('Service name must have at least 3 characters');
    });

    it('should reject zero estimated duration', () => {
      expect(
        () =>
          new Service({
            ...validServiceProps,
            estimatedDuration: 0,
          }),
      ).toThrow('Estimated duration must be greater than 0');
    });

    it('should reject negative estimated duration', () => {
      expect(
        () =>
          new Service({
            ...validServiceProps,
            estimatedDuration: -10,
          }),
      ).toThrow('Estimated duration must be greater than 0');
    });

    it('should reject negative price', () => {
      expect(
        () =>
          new Service({
            ...validServiceProps,
            price: -50,
          }),
      ).toThrow('Price cannot be negative');
    });

    it('should accept price of zero', () => {
      const service = new Service({
        ...validServiceProps,
        price: 0,
      });
      expect(service.getPrice()).toBe(0);
    });
  });

  describe('updateInfo', () => {
    it('should update service information', () => {
      const service = new Service(validServiceProps);
      service.updateInfo({
        name: 'Premium Oil Change',
        price: 200,
        estimatedDuration: 45,
      });

      expect(service.getName()).toBe('Premium Oil Change');
      expect(service.getPrice()).toBe(200);
      expect(service.getEstimatedDuration()).toBe(45);
    });

    it('should validate updated information', () => {
      const service = new Service(validServiceProps);
      expect(() =>
        service.updateInfo({
          name: 'AB',
        }),
      ).toThrow('Service name must have at least 3 characters');
    });

    it('should update only provided fields', () => {
      const service = new Service(validServiceProps);
      const originalName = service.getName();
      service.updateInfo({ price: 180 });

      expect(service.getName()).toBe(originalName);
      expect(service.getPrice()).toBe(180);
    });

    it('should update category', () => {
      const service = new Service(validServiceProps);
      service.updateInfo({ category: ServiceCategory.REPAIR });
      expect(service.getCategory()).toBe(ServiceCategory.REPAIR);
    });
  });

  describe('updatePrice', () => {
    it('should update price', () => {
      const service = new Service(validServiceProps);
      service.updatePrice(175);
      expect(service.getPrice()).toBe(175);
    });

    it('should reject negative price', () => {
      const service = new Service(validServiceProps);
      expect(() => service.updatePrice(-100)).toThrow('Price cannot be negative');
    });

    it('should accept price of zero', () => {
      const service = new Service(validServiceProps);
      service.updatePrice(0);
      expect(service.getPrice()).toBe(0);
    });
  });

  describe('deactivate and activate', () => {
    it('should deactivate service', () => {
      const service = new Service(validServiceProps);
      expect(service.isActive()).toBe(true);
      service.deactivate();
      expect(service.isActive()).toBe(false);
    });

    it('should activate service', () => {
      const service = new Service({
        ...validServiceProps,
        active: false,
      });
      expect(service.isActive()).toBe(false);
      service.activate();
      expect(service.isActive()).toBe(true);
    });
  });

  describe('Different service categories', () => {
    it('should create service with different categories', () => {
      const categories = [
        ServiceCategory.MAINTENANCE,
        ServiceCategory.REPAIR,
        ServiceCategory.INSPECTION,
        ServiceCategory.DIAGNOSTICS,
        ServiceCategory.ALIGNMENT,
        ServiceCategory.TIRE_SERVICE,
        ServiceCategory.ELECTRICAL,
        ServiceCategory.BODYWORK,
      ];

      categories.forEach((category) => {
        const service = new Service({
          ...validServiceProps,
          category,
        });
        expect(service.getCategory()).toBe(category);
      });
    });
  });

  describe('toJSON', () => {
    it('should return service as JSON object', () => {
      const service = new Service(validServiceProps);
      const json = service.toJSON();

      expect(json).toHaveProperty('name', 'Oil Change');
      expect(json).toHaveProperty('description', 'Complete oil and filter change');
      expect(json).toHaveProperty('estimatedDuration', 30);
      expect(json).toHaveProperty('price', 150.0);
      expect(json).toHaveProperty('category', ServiceCategory.MAINTENANCE);
      expect(json).toHaveProperty('active', true);
    });
  });
});
