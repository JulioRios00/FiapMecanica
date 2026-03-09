import { ServiceInactiveException } from './service-inactive.exception';

describe('ServiceInactiveException', () => {
  it('should create an instance with formatted message', () => {
    const serviceId = '123e4567-e89b-12d3-a456-426614174000';
    const serviceName = 'Oil Change';
    const exception = new ServiceInactiveException(serviceId, serviceName);

    expect(exception).toBeInstanceOf(Error);
    expect(exception.message).toBe(
      `Service "Oil Change" (ID: ${serviceId}) is not active and cannot be used`,
    );
    expect(exception.name).toBe('ServiceInactiveException');
  });

  it('should be throwable', () => {
    const exception = new ServiceInactiveException('service-1', 'Brake Repair');

    expect(() => {
      throw exception;
    }).toThrow(ServiceInactiveException);
  });

  it('should include service details in message', () => {
    const serviceId = 'svc-456';
    const serviceName = 'Tire Replacement';
    const exception = new ServiceInactiveException(serviceId, serviceName);

    expect(exception.message).toContain(serviceId);
    expect(exception.message).toContain(serviceName);
  });
});
