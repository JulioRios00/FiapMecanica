import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ApproveServiceOrderDto {
  @ApiProperty({ example: 'customer@email.com', description: 'Who approved' })
  @IsNotEmpty()
  @IsString()
  approvedBy: string;

  @ApiProperty({
    example: 500.00,
    required: false,
    description: 'Approved amount (optional, defaults to total)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  approvedAmount?: number;
}

