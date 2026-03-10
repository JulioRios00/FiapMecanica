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
import { CreatePartDto } from '@presentation/dtos/part/create-part.dto';
import { UpdatePartDto } from '@presentation/dtos/part/update-part.dto';
import { CreatePartUseCase } from '@application/use-cases/part/create-part.use-case';
import { GetPartUseCase } from '@application/use-cases/part/get-part.use-case';
import { ListPartsUseCase } from '@application/use-cases/part/list-parts.use-case';
import { UpdatePartUseCase } from '@application/use-cases/part/update-part.use-case';
import { DeletePartUseCase } from '@application/use-cases/part/delete-part.use-case';

@ApiTags('parts')
@Controller('parts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PartController {
  constructor(
    private readonly createPartUseCase: CreatePartUseCase,
    private readonly getPartUseCase: GetPartUseCase,
    private readonly listPartsUseCase: ListPartsUseCase,
    private readonly updatePartUseCase: UpdatePartUseCase,
    private readonly deletePartUseCase: DeletePartUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new part' })
  @ApiResponse({ status: 201, description: 'Part created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createPartDto: CreatePartDto) {
    return await this.createPartUseCase.execute(createPartDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all parts' })
  @ApiResponse({ status: 200, description: 'Parts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'active', required: false, description: 'Filter by active status' })
  @ApiQuery({ name: 'lowStock', required: false, description: 'Filter parts with low stock' })
  async findAll(@Query('active') active?: string, @Query('lowStock') lowStock?: string) {
    const filters: any = {};
    if (active !== undefined) filters.active = active === 'true';
    if (lowStock !== undefined) filters.lowStock = lowStock === 'true';

    return await this.listPartsUseCase.execute(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get part by ID' })
  @ApiResponse({ status: 200, description: 'Part retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Part not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.getPartUseCase.execute(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update part' })
  @ApiResponse({ status: 200, description: 'Part updated successfully' })
  @ApiResponse({ status: 404, description: 'Part not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updatePartDto: UpdatePartDto) {
    return await this.updatePartUseCase.execute(id, updatePartDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete part (soft delete)' })
  @ApiResponse({ status: 204, description: 'Part deleted successfully' })
  @ApiResponse({ status: 404, description: 'Part not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deletePartUseCase.execute(id);
  }
}
