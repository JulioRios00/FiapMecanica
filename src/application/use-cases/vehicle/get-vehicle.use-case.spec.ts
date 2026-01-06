import { Test, TestingModule } from '@nestjs/testing';
import { GetVehicleUseCase } from './get-vehicle.use-case';
import { VehicleRepositoryPort } from '@application/ports/vehicle.repository.port';
import { NotFoundException } from '@nestjs/common';
import { Vehicle } from '@domain/entities/vehicle.entity';

describe('GetVehicleUseCase', () => {
  let useCase: GetVehicleUseCase;
  let vehicleRepository: jest.Mocked<VehicleRepositoryPort>;

  const mockVehicle = new Vehicle({
    id: '123',
    licensePlate: 'ABC1234',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2023,
    customerId: 'customer-123',
    active: true,
  });

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetVehicleUseCase,
        {
          provide: VehicleRepositoryPort,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetVehicleUseCase>(GetVehicleUseCase);
    vehicleRepository = module.get(VehicleRepositoryPort);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return a vehicle when found', async () => {
    vehicleRepository.findById.mockResolvedValue(mockVehicle);

    const result = await useCase.execute('123');

    expect(result).toEqual(mockVehicle);
    expect(vehicleRepository.findById).toHaveBeenCalledWith('123');
  });

  it('should throw NotFoundException when vehicle not found', async () => {
    vehicleRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('999')).rejects.toThrow(NotFoundException);
    expect(vehicleRepository.findById).toHaveBeenCalledWith('999');
  });
});
