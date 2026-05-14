import { DomainException } from './domain.exception';

export class InvalidStatusTransitionException extends DomainException {
  constructor(fromStatus: string, toStatus: string) {
    super(`Invalid status transition from "${fromStatus}" to "${toStatus}"`);
    this.name = 'InvalidStatusTransitionException';
  }
}
