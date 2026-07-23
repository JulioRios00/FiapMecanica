export type ServiceOrderStatus =
  | 'OPEN'
  | 'AWAITING_QUOTE'
  | 'QUOTE_APPROVED'
  | 'IN_EXECUTION'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ServiceOrderProps {
  id?: string;
  orderNumber?: string;
  description: string;
  status?: ServiceOrderStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ServiceOrder {
  private readonly id?: string;
  private readonly orderNumber?: string;
  private readonly description: string;
  private status: ServiceOrderStatus;
  private readonly createdAt?: Date;
  private updatedAt?: Date;

  constructor(props: ServiceOrderProps) {
    this.id = props.id;
    this.orderNumber = props.orderNumber;
    this.description = props.description;
    this.status = props.status ?? 'OPEN';
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.validate();
  }

  private validate(): void {
    if (!this.description || this.description.trim().length < 5) {
      throw new Error('Description must have at least 5 characters');
    }
  }

  updateStatus(newStatus: ServiceOrderStatus): void {
    const transitions: Record<ServiceOrderStatus, ServiceOrderStatus[]> = {
      OPEN: ['AWAITING_QUOTE', 'CANCELLED'],
      AWAITING_QUOTE: ['QUOTE_APPROVED', 'CANCELLED'],
      QUOTE_APPROVED: ['IN_EXECUTION', 'CANCELLED'],
      IN_EXECUTION: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!transitions[this.status].includes(newStatus)) {
      throw new Error(`Invalid status transition: ${this.status} -> ${newStatus}`);
    }

    this.status = newStatus;
    this.updatedAt = new Date();
  }

  forceCancel(): void {
    if (this.status === 'COMPLETED') {
      throw new Error('Cannot cancel a completed service order');
    }
    this.status = 'CANCELLED';
    this.updatedAt = new Date();
  }

  getId(): string | undefined {
    return this.id;
  }

  getOrderNumber(): string | undefined {
    return this.orderNumber;
  }

  getDescription(): string {
    return this.description;
  }

  getStatus(): ServiceOrderStatus {
    return this.status;
  }

  toJSON() {
    return {
      id: this.id,
      orderNumber: this.orderNumber,
      description: this.description,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

