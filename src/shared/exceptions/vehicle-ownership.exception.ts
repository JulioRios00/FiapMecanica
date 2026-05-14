import { DomainException } from './domain.exception';

export class VehicleOwnershipException extends DomainException {
  constructor(vehicleId: string, customerId: string) {
    super(`Vehicle with ID "${vehicleId}" does not belong to customer with ID "${customerId}"`);
    this.name = 'VehicleOwnershipException';
  }
}
