import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ServiceCategory } from '@prisma/client';

export class UpdateServiceDto {
  @ApiPropertyOptional({
    description: 'Service name',
    example: 'Oil Change',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Service description',
    example: 'Complete oil and filter change',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Estimated duration in minutes',
    example: 30,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  estimatedDuration?: number;

  @ApiPropertyOptional({
    description: 'Service price',
    example: 150.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    description: 'Service category',
    enum: ServiceCategory,
    example: ServiceCategory.MAINTENANCE,
  })
  @IsEnum(ServiceCategory)
  @IsOptional()
  category?: ServiceCategory;
}
