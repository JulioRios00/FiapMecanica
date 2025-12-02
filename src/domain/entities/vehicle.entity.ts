import { LicensePlate } from '../value-objects/license-plate.value-object';

export interface VehicleProps {
  id?: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  chassisNumber?: string;
  customerId: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Vehicle {
  private readonly id?: string;
  private licensePlate: LicensePlate;
  private brand: string;
  private model: string;
  private year: number;
  private color?: string;
  private chassisNumber?: string;
  private customerId: string;
  private active: boolean;
  private readonly createdAt?: Date;
  private updatedAt?: Date;

  constructor(props: VehicleProps) {
    this.id = props.id;
    this.licensePlate = new LicensePlate(props.licensePlate);
    this.brand = props.brand;
    this.model = props.model;
    this.year = props.year;
    this.color = props.color;
    this.chassisNumber = props.chassisNumber;
    this.customerId = props.customerId;
    this.active = props.active ?? true;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;

    this.validate();
  }

  private validate(): void {
    if (!this.brand || this.brand.trim().length < 2) {
      throw new Error('Vehicle brand must have at least 2 characters');
    }

    if (!this.model || this.model.trim().length < 2) {
      throw new Error('Vehicle model must have at least 2 characters');
    }

    const currentYear = new Date().getFullYear();
    if (this.year < 1900 || this.year > currentYear + 1) {
      throw new Error(`Vehicle year must be between 1900 and ${currentYear + 1}`);
    }

    if (!this.customerId) {
      throw new Error('Customer ID is required');
    }
  }

  public updateInfo(data: Partial<VehicleProps>): void {
    if (data.brand !== undefined) this.brand = data.brand;
    if (data.model !== undefined) this.model = data.model;
    if (data.year !== undefined) this.year = data.year;
    if (data.color !== undefined) this.color = data.color;
    if (data.chassisNumber !== undefined) this.chassisNumber = data.chassisNumber;
    this.updatedAt = new Date();
    this.validate();
  }

  public deactivate(): void {
    this.active = false;
    this.updatedAt = new Date();
  }

  public activate(): void {
    this.active = true;
    this.updatedAt = new Date();
  }

  // Getters
  public getId(): string | undefined {
    return this.id;
  }

  public getLicensePlate(): LicensePlate {
    return this.licensePlate;
  }

  public getBrand(): string {
    return this.brand;
  }

  public getModel(): string {
    return this.model;
  }

  public getYear(): number {
    return this.year;
  }

  public getColor(): string | undefined {
    return this.color;
  }

  public getChassisNumber(): string | undefined {
    return this.chassisNumber;
  }

  public getCustomerId(): string {
    return this.customerId;
  }

  public isActive(): boolean {
    return this.active;
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
      licensePlate: this.licensePlate.getValue(),
      brand: this.brand,
      model: this.model,
      year: this.year,
      color: this.color,
      chassisNumber: this.chassisNumber,
      customerId: this.customerId,
      active: this.active,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

