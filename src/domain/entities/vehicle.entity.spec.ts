import { Vehicle, VehicleProps } from './vehicle.entity';

describe('Vehicle Entity', () => {
  const validVehicleProps: VehicleProps = {
    licensePlate: 'ABC1234',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2023,
    customerId: '123e4567-e89b-12d3-a456-426614174000',
  };

  describe('Constructor', () => {
    it('should create a valid vehicle', () => {
      const vehicle = new Vehicle(validVehicleProps);
      expect(vehicle).toBeDefined();
      expect(vehicle.getBrand()).toBe('Toyota');
      expect(vehicle.getModel()).toBe('Corolla');
      expect(vehicle.getYear()).toBe(2023);
      expect(vehicle.isActive()).toBe(true);
    });

    it('should accept optional color and chassisNumber', () => {
      const vehicleWithOptional = new Vehicle({
        ...validVehicleProps,
        color: 'Silver',
        chassisNumber: '9BWZZZ377VT004251',
      });
      expect(vehicleWithOptional.getColor()).toBe('Silver');
      expect(vehicleWithOptional.getChassisNumber()).toBe('9BWZZZ377VT004251');
    });

    it('should validate license plate format', () => {
      expect(
        () =>
          new Vehicle({
            ...validVehicleProps,
            licensePlate: 'INVALID',
          }),
      ).toThrow();
    });

    it('should accept Mercosul license plate format', () => {
      const vehicle = new Vehicle({
        ...validVehicleProps,
        licensePlate: 'ABC1D23',
      });
      expect(vehicle.getLicensePlate().getValue()).toBe('ABC1D23');
    });
  });

  describe('Validation', () => {
    it('should reject brand with less than 2 characters', () => {
      expect(
        () =>
          new Vehicle({
            ...validVehicleProps,
            brand: 'A',
          }),
      ).toThrow('Vehicle brand must have at least 2 characters');
    });

    it('should reject empty brand', () => {
      expect(
        () =>
          new Vehicle({
            ...validVehicleProps,
            brand: '',
          }),
      ).toThrow('Vehicle brand must have at least 2 characters');
    });

    it('should reject model with less than 2 characters', () => {
      expect(
        () =>
          new Vehicle({
            ...validVehicleProps,
            model: 'C',
          }),
      ).toThrow('Vehicle model must have at least 2 characters');
    });

    it('should reject year before 1900', () => {
      expect(
        () =>
          new Vehicle({
            ...validVehicleProps,
            year: 1899,
          }),
      ).toThrow('Vehicle year must be between 1900 and');
    });

    it('should reject year more than next year', () => {
      const currentYear = new Date().getFullYear();
      expect(
        () =>
          new Vehicle({
            ...validVehicleProps,
            year: currentYear + 2,
          }),
      ).toThrow('Vehicle year must be between 1900 and');
    });

    it('should accept current year', () => {
      const currentYear = new Date().getFullYear();
      const vehicle = new Vehicle({
        ...validVehicleProps,
        year: currentYear,
      });
      expect(vehicle.getYear()).toBe(currentYear);
    });

    it('should accept next year', () => {
      const nextYear = new Date().getFullYear() + 1;
      const vehicle = new Vehicle({
        ...validVehicleProps,
        year: nextYear,
      });
      expect(vehicle.getYear()).toBe(nextYear);
    });

    it('should require customerId', () => {
      expect(
        () =>
          new Vehicle({
            ...validVehicleProps,
            customerId: '',
          }),
      ).toThrow('Customer ID is required');
    });
  });

  describe('updateInfo', () => {
    it('should update vehicle information', () => {
      const vehicle = new Vehicle(validVehicleProps);
      vehicle.updateInfo({
        brand: 'Honda',
        model: 'Civic',
        year: 2024,
        color: 'Blue',
      });

      expect(vehicle.getBrand()).toBe('Honda');
      expect(vehicle.getModel()).toBe('Civic');
      expect(vehicle.getYear()).toBe(2024);
      expect(vehicle.getColor()).toBe('Blue');
    });

    it('should validate updated information', () => {
      const vehicle = new Vehicle(validVehicleProps);
      expect(() =>
        vehicle.updateInfo({
          brand: 'A',
        }),
      ).toThrow('Vehicle brand must have at least 2 characters');
    });

    it('should update only provided fields', () => {
      const vehicle = new Vehicle(validVehicleProps);
      const originalBrand = vehicle.getBrand();
      vehicle.updateInfo({ color: 'Red' });

      expect(vehicle.getBrand()).toBe(originalBrand);
      expect(vehicle.getColor()).toBe('Red');
    });
  });

  describe('deactivate and activate', () => {
    it('should deactivate vehicle', () => {
      const vehicle = new Vehicle(validVehicleProps);
      expect(vehicle.isActive()).toBe(true);
      vehicle.deactivate();
      expect(vehicle.isActive()).toBe(false);
    });

    it('should activate vehicle', () => {
      const vehicle = new Vehicle({
        ...validVehicleProps,
        active: false,
      });
      expect(vehicle.isActive()).toBe(false);
      vehicle.activate();
      expect(vehicle.isActive()).toBe(true);
    });
  });

  describe('toJSON', () => {
    it('should return vehicle as JSON object', () => {
      const vehicle = new Vehicle({
        ...validVehicleProps,
        color: 'Black',
      });
      const json = vehicle.toJSON();

      expect(json).toHaveProperty('licensePlate', 'ABC1234');
      expect(json).toHaveProperty('brand', 'Toyota');
      expect(json).toHaveProperty('model', 'Corolla');
      expect(json).toHaveProperty('year', 2023);
      expect(json).toHaveProperty('color', 'Black');
      expect(json).toHaveProperty('active', true);
    });
  });
});
