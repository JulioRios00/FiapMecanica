import { DomainException } from './domain.exception';

export class ServiceInactiveException extends DomainException {
  constructor(serviceId: string, serviceName: string) {
    super(`Service "${serviceName}" (ID: ${serviceId}) is not active and cannot be used`);
    this.name = 'ServiceInactiveException';
  }
}
