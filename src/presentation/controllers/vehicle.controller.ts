import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@infrastructure/auth/guards/jwt-auth.guard';
import { ParseUUIDPipe } from '@shared/pipes/parse-uuid.pipe';
import { CreateVehicleDto } from '@presentation/dtos/vehicle/create-vehicle.dto';
import { UpdateVehicleDto } from '@presentation/dtos/vehicle/update-vehicle.dto';
import { CreateVehicleUseCase } from '@application/use-cases/vehicle/create-vehicle.use-case';
import { GetVehicleUseCase } from '@application/use-cases/vehicle/get-vehicle.use-case';
import { ListVehiclesUseCase } from '@application/use-cases/vehicle/list-vehicles.use-case';
import { UpdateVehicleUseCase } from '@application/use-cases/vehicle/update-vehicle.use-case';
import { DeleteVehicleUseCase } from '@application/use-cases/vehicle/delete-vehicle.use-case';

@ApiTags('vehicles')
@Controller('vehicles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VehicleController {
  constructor(
    private readonly createVehicleUseCase: CreateVehicleUseCase,
    private readonly getVehicleUseCase: GetVehicleUseCase,
    private readonly listVehiclesUseCase: ListVehiclesUseCase,
    private readonly updateVehicleUseCase: UpdateVehicleUseCase,
    private readonly deleteVehicleUseCase: DeleteVehicleUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new vehicle' })
  @ApiResponse({ status: 201, description: 'Vehicle created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createVehicleDto: CreateVehicleDto) {
    return await this.createVehicleUseCase.execute(createVehicleDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all vehicles' })
  @ApiResponse({ status: 200, description: 'Vehicles retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'customerId', required: false, description: 'Filter by customer ID' })
  @ApiQuery({ name: 'active', required: false, description: 'Filter by active status' })
  async findAll(@Query('customerId') customerId?: string, @Query('active') active?: string) {
    const filters: any = {};
    if (customerId) filters.customerId = customerId;
    if (active !== undefined) filters.active = active === 'true';

    return await this.listVehiclesUseCase.execute(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  @ApiResponse({ status: 200, description: 'Vehicle retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.getVehicleUseCase.execute(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update vehicle' })
  @ApiResponse({ status: 200, description: 'Vehicle updated successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return await this.updateVehicleUseCase.execute(id, updateVehicleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete vehicle (soft delete)' })
  @ApiResponse({ status: 204, description: 'Vehicle deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteVehicleUseCase.execute(id);
  }
}
