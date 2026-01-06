import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';

export class UpdateVehicleDto {
  @ApiPropertyOptional({
    description: 'Vehicle brand',
    example: 'Toyota',
  })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({
    description: 'Vehicle model',
    example: 'Corolla',
  })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional({
    description: 'Vehicle year',
    example: 2023,
    minimum: 1900,
    maximum: 2100,
  })
  @IsInt()
  @Min(1900)
  @Max(2100)
  @IsOptional()
  year?: number;

  @ApiPropertyOptional({
    description: 'Vehicle color',
    example: 'Silver',
  })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({
    description: 'Chassis number',
    example: '9BWZZZ377VT004251',
  })
  @IsString()
  @IsOptional()
  chassisNumber?: string;
}
