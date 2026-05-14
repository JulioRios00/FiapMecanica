import { VehicleOwnershipException } from './vehicle-ownership.exception';

describe('VehicleOwnershipException', () => {
  it('should create an instance with formatted message', () => {
    const vehicleId = '123e4567-e89b-12d3-a456-426614174000';
    const customerId = '987fcdeb-51a2-43f7-b890-123456789abc';
    const exception = new VehicleOwnershipException(vehicleId, customerId);

    expect(exception).toBeInstanceOf(Error);
    expect(exception.message).toBe(
      `Vehicle with ID "${vehicleId}" does not belong to customer with ID "${customerId}"`,
    );
    expect(exception.name).toBe('VehicleOwnershipException');
  });

  it('should be throwable', () => {
    const exception = new VehicleOwnershipException('vehicle-1', 'customer-1');

    expect(() => {
      throw exception;
    }).toThrow(VehicleOwnershipException);
  });

  it('should include both IDs in message', () => {
    const vehicleId = 'abc-123';
    const customerId = 'xyz-789';
    const exception = new VehicleOwnershipException(vehicleId, customerId);

    expect(exception.message).toContain(vehicleId);
    expect(exception.message).toContain(customerId);
  });
});
