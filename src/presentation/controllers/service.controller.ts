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
import { CreateServiceDto } from '@presentation/dtos/service/create-service.dto';
import { UpdateServiceDto } from '@presentation/dtos/service/update-service.dto';
import { CreateServiceUseCase } from '@application/use-cases/service/create-service.use-case';
import { GetServiceUseCase } from '@application/use-cases/service/get-service.use-case';
import { ListServicesUseCase } from '@application/use-cases/service/list-services.use-case';
import { UpdateServiceUseCase } from '@application/use-cases/service/update-service.use-case';
import { DeleteServiceUseCase } from '@application/use-cases/service/delete-service.use-case';

@ApiTags('services')
@Controller('services')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ServiceController {
  constructor(
    private readonly createServiceUseCase: CreateServiceUseCase,
    private readonly getServiceUseCase: GetServiceUseCase,
    private readonly listServicesUseCase: ListServicesUseCase,
    private readonly updateServiceUseCase: UpdateServiceUseCase,
    private readonly deleteServiceUseCase: DeleteServiceUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service' })
  @ApiResponse({ status: 201, description: 'Service created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createServiceDto: CreateServiceDto) {
    return await this.createServiceUseCase.execute(createServiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all services' })
  @ApiResponse({ status: 200, description: 'Services retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'active', required: false, description: 'Filter by active status' })
  async findAll(@Query('category') category?: string, @Query('active') active?: string) {
    const filters: any = {};
    if (category) filters.category = category;
    if (active !== undefined) filters.active = active === 'true';

    return await this.listServicesUseCase.execute(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiResponse({ status: 200, description: 'Service retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.getServiceUseCase.execute(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update service' })
  @ApiResponse({ status: 200, description: 'Service updated successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return await this.updateServiceUseCase.execute(id, updateServiceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete service (soft delete)' })
  @ApiResponse({ status: 204, description: 'Service deleted successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteServiceUseCase.execute(id);
  }
}
