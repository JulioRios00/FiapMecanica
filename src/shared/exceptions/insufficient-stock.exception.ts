import { DomainException } from './domain.exception';

export class InsufficientStockException extends DomainException {
  constructor(partName: string, requested: number, available: number) {
    super(
      `Insufficient stock for part "${partName}". Requested: ${requested}, Available: ${available}`,
    );
    this.name = 'InsufficientStockException';
  }
}
