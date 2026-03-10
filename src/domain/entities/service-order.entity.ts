import { ServiceOrderStatus, Priority } from '@prisma/client';
import { Money } from '@domain/value-objects/money.value-object';
import { InvalidStatusTransitionException } from '@shared/exceptions/invalid-status-transition.exception';

export interface ServiceOrderProps {
  id?: string;
  orderNumber?: string;
  customerId: string;
  vehicleId: string;
  status?: ServiceOrderStatus;
  priority?: Priority;
  description: string;
  diagnosis?: string;
  observations?: string;
  estimatedCompletion?: Date;
  actualCompletion?: Date;
  totalAmount?: Money | number;
  approvedAmount?: Money | number;
  approvedAt?: Date;
  approvedBy?: string;
  createdBy?: string;
  assignedTo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ServiceOrder {
  private readonly id?: string;
  private orderNumber?: string;
  private customerId: string;
  private vehicleId: string;
  private status: ServiceOrderStatus;
  private priority: Priority;
  private description: string;
  private diagnosis?: string;
  private observations?: string;
  private estimatedCompletion?: Date;
  private actualCompletion?: Date;
  private totalAmount: Money;
  private approvedAmount?: Money;
  private approvedAt?: Date;
  private approvedBy?: string;
  private createdBy?: string;
  private assignedTo?: string;
  private readonly createdAt?: Date;
  private updatedAt?: Date;

  constructor(props: ServiceOrderProps) {
    this.id = props.id;
    this.orderNumber = props.orderNumber;
    this.customerId = props.customerId;
    this.vehicleId = props.vehicleId;
    this.status = props.status ?? ServiceOrderStatus.RECEIVED;
    this.priority = props.priority ?? Priority.NORMAL;
    this.description = props.description;
    this.diagnosis = props.diagnosis;
    this.observations = props.observations;
    this.estimatedCompletion = props.estimatedCompletion;
    this.actualCompletion = props.actualCompletion;
    this.totalAmount = this.toMoney(props.totalAmount ?? 0);
    this.approvedAmount = props.approvedAmount ? this.toMoney(props.approvedAmount) : undefined;
    this.approvedAt = props.approvedAt;
    this.approvedBy = props.approvedBy;
    this.createdBy = props.createdBy;
    this.assignedTo = props.assignedTo;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;

    this.validate();
  }

  private toMoney(value: Money | number): Money {
    return value instanceof Money ? value : new Money(value);
  }

  private validate(): void {
    if (!this.customerId) {
      throw new Error('Customer ID is required');
    }

    if (!this.vehicleId) {
      throw new Error('Vehicle ID is required');
    }

    if (!this.description || this.description.trim().length < 5) {
      throw new Error('Description must have at least 5 characters');
    }

    // Money VO already validates non-negative amounts, so no need to check here
  }

  public updateStatus(newStatus: ServiceOrderStatus): void {
    this.validateStatusTransition(this.status, newStatus);
    this.status = newStatus;
    this.updatedAt = new Date();

    if (newStatus === ServiceOrderStatus.COMPLETED && !this.actualCompletion) {
      this.actualCompletion = new Date();
    }
  }

  private validateStatusTransition(
    currentStatus: ServiceOrderStatus,
    newStatus: ServiceOrderStatus,
  ): void {
    const validTransitions: Record<ServiceOrderStatus, ServiceOrderStatus[]> = {
      [ServiceOrderStatus.RECEIVED]: [
        ServiceOrderStatus.IN_DIAGNOSIS,
        ServiceOrderStatus.CANCELLED,
      ],
      [ServiceOrderStatus.IN_DIAGNOSIS]: [
        ServiceOrderStatus.AWAITING_APPROVAL,
        ServiceOrderStatus.IN_PROGRESS,
        ServiceOrderStatus.CANCELLED,
      ],
      [ServiceOrderStatus.AWAITING_APPROVAL]: [
        ServiceOrderStatus.APPROVED,
        ServiceOrderStatus.IN_DIAGNOSIS,
        ServiceOrderStatus.CANCELLED,
      ],
      [ServiceOrderStatus.APPROVED]: [
        ServiceOrderStatus.IN_PROGRESS,
        ServiceOrderStatus.AWAITING_PARTS,
        ServiceOrderStatus.CANCELLED,
      ],
      [ServiceOrderStatus.IN_PROGRESS]: [
        ServiceOrderStatus.AWAITING_PARTS,
        ServiceOrderStatus.COMPLETED,
        ServiceOrderStatus.CANCELLED,
      ],
      [ServiceOrderStatus.AWAITING_PARTS]: [
        ServiceOrderStatus.IN_PROGRESS,
        ServiceOrderStatus.CANCELLED,
      ],
      [ServiceOrderStatus.COMPLETED]: [
        ServiceOrderStatus.DELIVERED,
        ServiceOrderStatus.IN_PROGRESS,
      ],
      [ServiceOrderStatus.DELIVERED]: [],
      [ServiceOrderStatus.CANCELLED]: [],
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new InvalidStatusTransitionException(currentStatus, newStatus);
    }
  }

  public approve(approvedBy: string, amount?: Money | number): void {
    if (this.status !== ServiceOrderStatus.AWAITING_APPROVAL) {
      throw new Error('Order must be in AWAITING_APPROVAL status to be approved');
    }

    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
    this.approvedAmount = amount ? this.toMoney(amount) : this.totalAmount;
    this.updateStatus(ServiceOrderStatus.APPROVED);
  }

  public reject(rejectedBy: string, reason?: string): void {
    if (this.status !== ServiceOrderStatus.AWAITING_APPROVAL) {
      throw new Error('Order must be in AWAITING_APPROVAL status to be rejected');
    }

    if (reason) {
      this.addObservation(`Rejected by ${rejectedBy}: ${reason}`);
    }
    this.updateStatus(ServiceOrderStatus.CANCELLED);
  }

  public updateDiagnosis(diagnosis: string): void {
    this.diagnosis = diagnosis;
    this.updatedAt = new Date();
  }

  public updateTotalAmount(amount: Money | number): void {
    this.totalAmount = this.toMoney(amount);
    this.updatedAt = new Date();
  }

  public assignTo(userId: string): void {
    this.assignedTo = userId;
    this.updatedAt = new Date();
  }

  public updatePriority(priority: Priority): void {
    this.priority = priority;
    this.updatedAt = new Date();
  }

  public setEstimatedCompletion(date: Date): void {
    this.estimatedCompletion = date;
    this.updatedAt = new Date();
  }

  public addObservation(observation: string): void {
    if (this.observations) {
      this.observations += `\n${observation}`;
    } else {
      this.observations = observation;
    }
    this.updatedAt = new Date();
  }

  public isApproved(): boolean {
    return !!this.approvedAt && !!this.approvedBy;
  }

  public isCompleted(): boolean {
    return (
      this.status === ServiceOrderStatus.COMPLETED || this.status === ServiceOrderStatus.DELIVERED
    );
  }

  public isCancelled(): boolean {
    return this.status === ServiceOrderStatus.CANCELLED;
  }

  public getId(): string | undefined {
    return this.id;
  }

  public getOrderNumber(): string | undefined {
    return this.orderNumber;
  }

  public getCustomerId(): string {
    return this.customerId;
  }

  public getVehicleId(): string {
    return this.vehicleId;
  }

  public getStatus(): ServiceOrderStatus {
    return this.status;
  }

  public getPriority(): Priority {
    return this.priority;
  }

  public getDescription(): string {
    return this.description;
  }

  public getDiagnosis(): string | undefined {
    return this.diagnosis;
  }

  public getObservations(): string | undefined {
    return this.observations;
  }

  public getEstimatedCompletion(): Date | undefined {
    return this.estimatedCompletion;
  }

  public getActualCompletion(): Date | undefined {
    return this.actualCompletion;
  }

  public getTotalAmount(): Money {
    return this.totalAmount;
  }

  public getApprovedAmount(): Money | undefined {
    return this.approvedAmount;
  }

  public getApprovedAt(): Date | undefined {
    return this.approvedAt;
  }

  public getApprovedBy(): string | undefined {
    return this.approvedBy;
  }

  public getCreatedBy(): string | undefined {
    return this.createdBy;
  }

  public getAssignedTo(): string | undefined {
    return this.assignedTo;
  }

  public getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  public getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  public toJSON() {
    return {
      id: this.id,
      orderNumber: this.orderNumber,
      customerId: this.customerId,
      vehicleId: this.vehicleId,
      status: this.status,
      priority: this.priority,
      description: this.description,
      diagnosis: this.diagnosis,
      observations: this.observations,
      estimatedCompletion: this.estimatedCompletion,
      actualCompletion: this.actualCompletion,
      totalAmount: this.totalAmount.toNumber(),
      approvedAmount: this.approvedAmount?.toNumber(),
      approvedAt: this.approvedAt,
      approvedBy: this.approvedBy,
      createdBy: this.createdBy,
      assignedTo: this.assignedTo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
