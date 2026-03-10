import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdatePartDto {
  @ApiPropertyOptional({
    description: 'Part name',
    example: 'Engine Oil Filter',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Part description',
    example: 'High-quality oil filter for diesel engines',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Manufacturer',
    example: 'Bosch',
  })
  @IsString()
  @IsOptional()
  manufacturer?: string;

  @ApiPropertyOptional({
    description: 'Part price',
    example: 45.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    description: 'Stock quantity',
    example: 50,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  stockQuantity?: number;

  @ApiPropertyOptional({
    description: 'Minimum stock level for alerts',
    example: 10,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  minStockLevel?: number;

  @ApiPropertyOptional({
    description: 'Unit of measurement',
    example: 'un',
  })
  @IsString()
  @IsOptional()
  unit?: string;
}
