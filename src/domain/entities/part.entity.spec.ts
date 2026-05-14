import { Part, PartProps } from './part.entity';

describe('Part Entity', () => {
  const validPartProps: PartProps = {
    name: 'Engine Oil Filter',
    partNumber: 'EOF-12345',
    manufacturer: 'Bosch',
    price: 45.5,
    stockQuantity: 100,
    minStockLevel: 10,
  };

  describe('Constructor', () => {
    it('should create a valid part', () => {
      const part = new Part(validPartProps);
      expect(part).toBeDefined();
      expect(part.getName()).toBe('Engine Oil Filter');
      expect(part.getPartNumber()).toBe('EOF-12345');
      expect(part.getPrice()).toBe(45.5);
      expect(part.getStockQuantity()).toBe(100);
      expect(part.isActive()).toBe(true);
    });

    it('should set default values', () => {
      const part = new Part({
        name: 'Simple Part',
        partNumber: 'SP-001',
        price: 10,
      });
      expect(part.getStockQuantity()).toBe(0);
      expect(part.getMinStockLevel()).toBe(5);
      expect(part.getUnit()).toBe('un');
      expect(part.isActive()).toBe(true);
    });

    it('should accept optional description and manufacturer', () => {
      const part = new Part({
        ...validPartProps,
        description: 'High-quality oil filter',
      });
      expect(part.getDescription()).toBe('High-quality oil filter');
      expect(part.getManufacturer()).toBe('Bosch');
    });
  });

  describe('Validation', () => {
    it('should reject name with less than 2 characters', () => {
      expect(
        () =>
          new Part({
            ...validPartProps,
            name: 'A',
          }),
      ).toThrow('Part name must have at least 2 characters');
    });

    it('should reject empty name', () => {
      expect(
        () =>
          new Part({
            ...validPartProps,
            name: '',
          }),
      ).toThrow('Part name must have at least 2 characters');
    });

    it('should reject partNumber with less than 2 characters', () => {
      expect(
        () =>
          new Part({
            ...validPartProps,
            partNumber: 'A',
          }),
      ).toThrow('Part number must have at least 2 characters');
    });

    it('should reject negative price', () => {
      expect(
        () =>
          new Part({
            ...validPartProps,
            price: -10,
          }),
      ).toThrow('Price cannot be negative');
    });

    it('should reject negative stock quantity', () => {
      expect(
        () =>
          new Part({
            ...validPartProps,
            stockQuantity: -5,
          }),
      ).toThrow('Stock quantity cannot be negative');
    });

    it('should reject negative min stock level', () => {
      expect(
        () =>
          new Part({
            ...validPartProps,
            minStockLevel: -1,
          }),
      ).toThrow('Minimum stock level cannot be negative');
    });

    it('should accept price of zero', () => {
      const part = new Part({
        ...validPartProps,
        price: 0,
      });
      expect(part.getPrice()).toBe(0);
    });
  });

  describe('updateInfo', () => {
    it('should update part information', () => {
      const part = new Part(validPartProps);
      part.updateInfo({
        name: 'Premium Oil Filter',
        price: 55.0,
        manufacturer: 'Mann-Filter',
      });

      expect(part.getName()).toBe('Premium Oil Filter');
      expect(part.getPrice()).toBe(55.0);
      expect(part.getManufacturer()).toBe('Mann-Filter');
    });

    it('should validate updated information', () => {
      const part = new Part(validPartProps);
      expect(() =>
        part.updateInfo({
          name: 'A',
        }),
      ).toThrow('Part name must have at least 2 characters');
    });

    it('should update only provided fields', () => {
      const part = new Part(validPartProps);
      const originalName = part.getName();
      part.updateInfo({ price: 50 });

      expect(part.getName()).toBe(originalName);
      expect(part.getPrice()).toBe(50);
    });
  });

  describe('updatePrice', () => {
    it('should update price', () => {
      const part = new Part(validPartProps);
      part.updatePrice(60);
      expect(part.getPrice()).toBe(60);
    });

    it('should reject negative price', () => {
      const part = new Part(validPartProps);
      expect(() => part.updatePrice(-10)).toThrow('Price cannot be negative');
    });
  });

  describe('Stock Management', () => {
    describe('addStock', () => {
      it('should add stock', () => {
        const part = new Part(validPartProps);
        const initialStock = part.getStockQuantity();
        part.addStock(50);
        expect(part.getStockQuantity()).toBe(initialStock + 50);
      });

      it('should reject zero or negative quantity', () => {
        const part = new Part(validPartProps);
        expect(() => part.addStock(0)).toThrow('Quantity must be greater than 0');
        expect(() => part.addStock(-10)).toThrow('Quantity must be greater than 0');
      });
    });

    describe('removeStock', () => {
      it('should remove stock', () => {
        const part = new Part(validPartProps);
        part.removeStock(30);
        expect(part.getStockQuantity()).toBe(70);
      });

      it('should reject zero or negative quantity', () => {
        const part = new Part(validPartProps);
        expect(() => part.removeStock(0)).toThrow('Quantity must be greater than 0');
        expect(() => part.removeStock(-10)).toThrow('Quantity must be greater than 0');
      });

      it('should reject removal when insufficient stock', () => {
        const part = new Part({
          ...validPartProps,
          stockQuantity: 10,
        });
        expect(() => part.removeStock(20)).toThrow('Insufficient stock');
      });
    });

    describe('setStock', () => {
      it('should set stock quantity', () => {
        const part = new Part(validPartProps);
        part.setStock(200);
        expect(part.getStockQuantity()).toBe(200);
      });

      it('should reject negative quantity', () => {
        const part = new Part(validPartProps);
        expect(() => part.setStock(-5)).toThrow('Stock quantity cannot be negative');
      });

      it('should accept zero quantity', () => {
        const part = new Part(validPartProps);
        part.setStock(0);
        expect(part.getStockQuantity()).toBe(0);
      });
    });

    describe('isLowStock', () => {
      it('should return true when stock is at minimum level', () => {
        const part = new Part({
          ...validPartProps,
          stockQuantity: 10,
          minStockLevel: 10,
        });
        expect(part.isLowStock()).toBe(true);
      });

      it('should return true when stock is below minimum level', () => {
        const part = new Part({
          ...validPartProps,
          stockQuantity: 5,
          minStockLevel: 10,
        });
        expect(part.isLowStock()).toBe(true);
      });

      it('should return false when stock is above minimum level', () => {
        const part = new Part({
          ...validPartProps,
          stockQuantity: 20,
          minStockLevel: 10,
        });
        expect(part.isLowStock()).toBe(false);
      });
    });
  });

  describe('deactivate and activate', () => {
    it('should deactivate part', () => {
      const part = new Part(validPartProps);
      expect(part.isActive()).toBe(true);
      part.deactivate();
      expect(part.isActive()).toBe(false);
    });

    it('should activate part', () => {
      const part = new Part({
        ...validPartProps,
        active: false,
      });
      expect(part.isActive()).toBe(false);
      part.activate();
      expect(part.isActive()).toBe(true);
    });
  });

  describe('toJSON', () => {
    it('should return part as JSON object', () => {
      const part = new Part({
        ...validPartProps,
        description: 'Test description',
      });
      const json = part.toJSON();

      expect(json).toHaveProperty('name', 'Engine Oil Filter');
      expect(json).toHaveProperty('partNumber', 'EOF-12345');
      expect(json).toHaveProperty('manufacturer', 'Bosch');
      expect(json).toHaveProperty('price', 45.5);
      expect(json).toHaveProperty('stockQuantity', 100);
      expect(json).toHaveProperty('minStockLevel', 10);
      expect(json).toHaveProperty('active', true);
    });
  });
});
