import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Priority } from '@prisma/client';

class ServiceItemDto {
  @ApiProperty({ description: 'Service ID' })
  @IsNotEmpty()
  @IsUUID()
  serviceId: string;

  @ApiProperty({ example: 1, description: 'Quantity' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;
}

class PartItemDto {
  @ApiProperty({ description: 'Part ID' })
  @IsNotEmpty()
  @IsUUID()
  partId: string;

  @ApiProperty({ example: 2, description: 'Quantity' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateServiceOrderDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsNotEmpty()
  @IsUUID()
  customerId: string;

  @ApiProperty({ description: 'Vehicle ID' })
  @IsNotEmpty()
  @IsUUID()
  vehicleId: string;

  @ApiProperty({
    example: 'Engine making strange noise',
    description: 'Problem description',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  description: string;

  @ApiProperty({
    enum: Priority,
    example: Priority.NORMAL,
    required: false,
    default: Priority.NORMAL,
  })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiProperty({ type: [ServiceItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceItemDto)
  services?: ServiceItemDto[];

  @ApiProperty({ type: [PartItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartItemDto)
  parts?: PartItemDto[];
}

