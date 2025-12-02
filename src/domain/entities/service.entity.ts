import { ServiceCategory } from '@prisma/client';

export interface ServiceProps {
  id?: string;
  name: string;
  description?: string;
  estimatedDuration: number; // in minutes
  price: number;
  category: ServiceCategory;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Service {
  private readonly id?: string;
  private name: string;
  private description?: string;
  private estimatedDuration: number;
  private price: number;
  private category: ServiceCategory;
  private active: boolean;
  private readonly createdAt?: Date;
  private updatedAt?: Date;

  constructor(props: ServiceProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.estimatedDuration = props.estimatedDuration;
    this.price = props.price;
    this.category = props.category;
    this.active = props.active ?? true;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;

    this.validate();
  }

  private validate(): void {
    if (!this.name || this.name.trim().length < 3) {
      throw new Error('Service name must have at least 3 characters');
    }

    if (this.estimatedDuration <= 0) {
      throw new Error('Estimated duration must be greater than 0');
    }

    if (this.price < 0) {
      throw new Error('Price cannot be negative');
    }
  }

  public updateInfo(data: Partial<ServiceProps>): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.description !== undefined) this.description = data.description;
    if (data.estimatedDuration !== undefined) this.estimatedDuration = data.estimatedDuration;
    if (data.price !== undefined) this.price = data.price;
    if (data.category !== undefined) this.category = data.category;
    this.updatedAt = new Date();
    this.validate();
  }

  public updatePrice(newPrice: number): void {
    if (newPrice < 0) {
      throw new Error('Price cannot be negative');
    }
    this.price = newPrice;
    this.updatedAt = new Date();
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

  public getName(): string {
    return this.name;
  }

  public getDescription(): string | undefined {
    return this.description;
  }

  public getEstimatedDuration(): number {
    return this.estimatedDuration;
  }

  public getPrice(): number {
    return this.price;
  }

  public getCategory(): ServiceCategory {
    return this.category;
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
      name: this.name,
      description: this.description,
      estimatedDuration: this.estimatedDuration,
      price: this.price,
      category: this.category,
      active: this.active,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

