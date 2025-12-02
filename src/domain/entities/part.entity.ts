export interface PartProps {
  id?: string;
  name: string;
  description?: string;
  partNumber: string;
  manufacturer?: string;
  price: number;
  stockQuantity?: number;
  minStockLevel?: number;
  unit?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Part {
  private readonly id?: string;
  private name: string;
  private description?: string;
  private partNumber: string;
  private manufacturer?: string;
  private price: number;
  private stockQuantity: number;
  private minStockLevel: number;
  private unit: string;
  private active: boolean;
  private readonly createdAt?: Date;
  private updatedAt?: Date;

  constructor(props: PartProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.partNumber = props.partNumber;
    this.manufacturer = props.manufacturer;
    this.price = props.price;
    this.stockQuantity = props.stockQuantity ?? 0;
    this.minStockLevel = props.minStockLevel ?? 5;
    this.unit = props.unit ?? 'un';
    this.active = props.active ?? true;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;

    this.validate();
  }

  private validate(): void {
    if (!this.name || this.name.trim().length < 2) {
      throw new Error('Part name must have at least 2 characters');
    }

    if (!this.partNumber || this.partNumber.trim().length < 2) {
      throw new Error('Part number must have at least 2 characters');
    }

    if (this.price < 0) {
      throw new Error('Price cannot be negative');
    }

    if (this.stockQuantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }

    if (this.minStockLevel < 0) {
      throw new Error('Minimum stock level cannot be negative');
    }
  }

  public updateInfo(data: Partial<PartProps>): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.description !== undefined) this.description = data.description;
    if (data.manufacturer !== undefined) this.manufacturer = data.manufacturer;
    if (data.price !== undefined) this.price = data.price;
    if (data.minStockLevel !== undefined) this.minStockLevel = data.minStockLevel;
    if (data.unit !== undefined) this.unit = data.unit;
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

  public addStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    this.stockQuantity += quantity;
    this.updatedAt = new Date();
  }

  public removeStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    if (this.stockQuantity < quantity) {
      throw new Error('Insufficient stock');
    }
    this.stockQuantity -= quantity;
    this.updatedAt = new Date();
  }

  public setStock(quantity: number): void {
    if (quantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }
    this.stockQuantity = quantity;
    this.updatedAt = new Date();
  }

  public isLowStock(): boolean {
    return this.stockQuantity <= this.minStockLevel;
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

  public getPartNumber(): string {
    return this.partNumber;
  }

  public getManufacturer(): string | undefined {
    return this.manufacturer;
  }

  public getPrice(): number {
    return this.price;
  }

  public getStockQuantity(): number {
    return this.stockQuantity;
  }

  public getMinStockLevel(): number {
    return this.minStockLevel;
  }

  public getUnit(): string {
    return this.unit;
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
      partNumber: this.partNumber,
      manufacturer: this.manufacturer,
      price: this.price,
      stockQuantity: this.stockQuantity,
      minStockLevel: this.minStockLevel,
      unit: this.unit,
      active: this.active,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

