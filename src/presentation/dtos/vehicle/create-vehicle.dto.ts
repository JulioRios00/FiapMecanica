import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min, MinLength } from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({ example: 'ABC1234', description: 'Vehicle license plate' })
  @IsNotEmpty()
  @IsString()
  licensePlate: string;

  @ApiProperty({ example: 'Toyota', description: 'Vehicle brand' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  brand: string;

  @ApiProperty({ example: 'Corolla', description: 'Vehicle model' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  model: string;

  @ApiProperty({ example: 2023, description: 'Vehicle year' })
  @IsNotEmpty()
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @ApiProperty({ example: 'Silver', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ example: '9BWZZZ377VT004251', required: false })
  @IsOptional()
  @IsString()
  chassisNumber?: string;

  @ApiProperty({ description: 'Customer ID' })
  @IsNotEmpty()
  @IsUUID()
  customerId: string;
}

