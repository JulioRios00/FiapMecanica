import { DocumentType } from '@prisma/client';
import { Document } from '../value-objects/document.value-object';
import { Email } from '../value-objects/email.value-object';

export interface CustomerProps {
  id?: string;
  name: string;
  documentType: DocumentType;
  document: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Customer {
  private readonly id?: string;
  private name: string;
  private document: Document;
  private email: Email;
  private phone: string;
  private address?: string;
  private city?: string;
  private state?: string;
  private zipCode?: string;
  private active: boolean;
  private readonly createdAt?: Date;
  private updatedAt?: Date;

  constructor(props: CustomerProps) {
    this.id = props.id;
    this.name = props.name;
    this.document = new Document(props.document, props.documentType);
    this.email = new Email(props.email);
    this.phone = props.phone;
    this.address = props.address;
    this.city = props.city;
    this.state = props.state;
    this.zipCode = props.zipCode;
    this.active = props.active ?? true;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;

    this.validate();
  }

  private validate(): void {
    if (!this.name || this.name.trim().length < 3) {
      throw new Error('Customer name must have at least 3 characters');
    }

    if (!this.phone || this.phone.length < 10) {
      throw new Error('Invalid phone number');
    }
  }

  public updateInfo(data: Partial<CustomerProps>): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.phone !== undefined) this.phone = data.phone;
    if (data.address !== undefined) this.address = data.address;
    if (data.city !== undefined) this.city = data.city;
    if (data.state !== undefined) this.state = data.state;
    if (data.zipCode !== undefined) this.zipCode = data.zipCode;
    if (data.email !== undefined) this.email = new Email(data.email);
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

  public getName(): string {
    return this.name;
  }

  public getDocument(): Document {
    return this.document;
  }

  public getEmail(): Email {
    return this.email;
  }

  public getPhone(): string {
    return this.phone;
  }

  public getAddress(): string | undefined {
    return this.address;
  }

  public getCity(): string | undefined {
    return this.city;
  }

  public getState(): string | undefined {
    return this.state;
  }

  public getZipCode(): string | undefined {
    return this.zipCode;
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
      documentType: this.document.getType(),
      document: this.document.getValue(),
      email: this.email.getValue(),
      phone: this.phone,
      address: this.address,
      city: this.city,
      state: this.state,
      zipCode: this.zipCode,
      active: this.active,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

