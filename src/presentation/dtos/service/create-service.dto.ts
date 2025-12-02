import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ServiceCategory } from '@prisma/client';

export class CreateServiceDto {
  @ApiProperty({ example: 'Oil Change', description: 'Service name' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'Complete oil and filter change', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 60, description: 'Estimated duration in minutes' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  estimatedDuration: number;

  @ApiProperty({ example: 150.00, description: 'Service price' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    enum: ServiceCategory,
    example: ServiceCategory.MAINTENANCE,
    description: 'Service category',
  })
  @IsNotEmpty()
  @IsEnum(ServiceCategory)
  category: ServiceCategory;
}

