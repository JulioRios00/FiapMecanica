import { ServiceOrderStatus, Priority } from '@prisma/client';

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
  totalAmount?: number;
  approvedAmount?: number;
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
  private totalAmount: number;
  private approvedAmount?: number;
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
    this.totalAmount = props.totalAmount ?? 0;
    this.approvedAmount = props.approvedAmount;
    this.approvedAt = props.approvedAt;
    this.approvedBy = props.approvedBy;
    this.createdBy = props.createdBy;
    this.assignedTo = props.assignedTo;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;

    this.validate();
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

    if (this.totalAmount < 0) {
      throw new Error('Total amount cannot be negative');
    }
  }

  public updateStatus(newStatus: ServiceOrderStatus): void {
    this.validateStatusTransition(this.status, newStatus);
    this.status = newStatus;
    this.updatedAt = new Date();

    // Automatically set completion date when status is COMPLETED or DELIVERED
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
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  public approve(approvedBy: string, amount?: number): void {
    if (this.status !== ServiceOrderStatus.AWAITING_APPROVAL) {
      throw new Error('Order must be in AWAITING_APPROVAL status to be approved');
    }

    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
    this.approvedAmount = amount ?? this.totalAmount;
    this.updateStatus(ServiceOrderStatus.APPROVED);
  }

  public updateDiagnosis(diagnosis: string): void {
    this.diagnosis = diagnosis;
    this.updatedAt = new Date();
  }

  public updateTotalAmount(amount: number): void {
    if (amount < 0) {
      throw new Error('Total amount cannot be negative');
    }
    this.totalAmount = amount;
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
      this.status === ServiceOrderStatus.COMPLETED ||
      this.status === ServiceOrderStatus.DELIVERED
    );
  }

  public isCancelled(): boolean {
    return this.status === ServiceOrderStatus.CANCELLED;
  }

  // Getters
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

  public getTotalAmount(): number {
    return this.totalAmount;
  }

  public getApprovedAmount(): number | undefined {
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
      totalAmount: this.totalAmount,
      approvedAmount: this.approvedAmount,
      approvedAt: this.approvedAt,
      approvedBy: this.approvedBy,
      createdBy: this.createdBy,
      assignedTo: this.assignedTo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

