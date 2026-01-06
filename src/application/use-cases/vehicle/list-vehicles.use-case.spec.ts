import { Test, TestingModule } from '@nestjs/testing';
import { ListVehiclesUseCase } from './list-vehicles.use-case';
import { VehicleRepositoryPort } from '@application/ports/vehicle.repository.port';
import { Vehicle } from '@domain/entities/vehicle.entity';

describe('ListVehiclesUseCase', () => {
  let useCase: ListVehiclesUseCase;
  let vehicleRepository: jest.Mocked<VehicleRepositoryPort>;

  const mockVehicles = [
    new Vehicle({
      id: '1',
      licensePlate: 'ABC1234',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2023,
      customerId: 'customer-1',
      active: true,
    }),
    new Vehicle({
      id: '2',
      licensePlate: 'XYZ5678',
      brand: 'Honda',
      model: 'Civic',
      year: 2024,
      customerId: 'customer-1',
      active: true,
    }),
  ];

  beforeEach(async () => {
    const mockRepository = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListVehiclesUseCase,
        {
          provide: VehicleRepositoryPort,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<ListVehiclesUseCase>(ListVehiclesUseCase);
    vehicleRepository = module.get(VehicleRepositoryPort);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return all vehicles', async () => {
    const paginatedResult = {
      data: mockVehicles,
      total: mockVehicles.length,
      page: 1,
      limit: 10,
    };
    vehicleRepository.findAll.mockResolvedValue(paginatedResult);

    const result = await useCase.execute();

    expect(result).toEqual(paginatedResult);
    expect(vehicleRepository.findAll).toHaveBeenCalledWith(undefined);
  });

  it('should return vehicles filtered by customerId', async () => {
    const filteredVehicles = [mockVehicles[0]];
    const paginatedResult = {
      data: filteredVehicles,
      total: filteredVehicles.length,
      page: 1,
      limit: 10,
    };
    vehicleRepository.findAll.mockResolvedValue(paginatedResult);

    const result = await useCase.execute({ customerId: 'customer-1' });

    expect(result).toEqual(paginatedResult);
    expect(vehicleRepository.findAll).toHaveBeenCalledWith({ customerId: 'customer-1' });
  });

  it('should return vehicles filtered by active status', async () => {
    const paginatedResult = {
      data: mockVehicles,
      total: mockVehicles.length,
      page: 1,
      limit: 10,
    };
    vehicleRepository.findAll.mockResolvedValue(paginatedResult);

    const result = await useCase.execute({ active: true });

    expect(result).toEqual(paginatedResult);
    expect(vehicleRepository.findAll).toHaveBeenCalledWith({ active: true });
  });
});
