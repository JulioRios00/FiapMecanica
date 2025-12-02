import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class CreateCustomerDto {
  @ApiProperty({ example: 'John Doe', description: 'Customer name' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    enum: DocumentType,
    example: DocumentType.CPF,
    description: 'Document type (CPF or CNPJ)',
  })
  @IsNotEmpty()
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiProperty({
    example: '12345678901',
    description: 'CPF (11 digits) or CNPJ (14 digits)',
  })
  @IsNotEmpty()
  @IsString()
  document: string;

  @ApiProperty({ example: 'john.doe@email.com', description: 'Customer email' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '11987654321', description: 'Customer phone number' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: '123 Main St', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'São Paulo', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'SP', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: '01234567', required: false })
  @IsOptional()
  @IsString()
  zipCode?: string;
}

