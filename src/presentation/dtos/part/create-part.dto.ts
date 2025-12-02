import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreatePartDto {
  @ApiProperty({ example: 'Oil Filter', description: 'Part name' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'High-quality oil filter', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'OF-12345', description: 'Part number' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  partNumber: string;

  @ApiProperty({ example: 'Bosch', required: false })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiProperty({ example: 45.50, description: 'Part price' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 50, description: 'Initial stock quantity', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stockQuantity?: number;

  @ApiProperty({ example: 10, description: 'Minimum stock level', default: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  minStockLevel?: number;

  @ApiProperty({ example: 'un', description: 'Unit of measurement', default: 'un' })
  @IsOptional()
  @IsString()
  unit?: string;
}

