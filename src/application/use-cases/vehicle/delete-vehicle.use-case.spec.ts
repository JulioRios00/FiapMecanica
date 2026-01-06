import { Test, TestingModule } from '@nestjs/testing';
import { DeleteVehicleUseCase } from './delete-vehicle.use-case';
import { VehicleRepositoryPort } from '@application/ports/vehicle.repository.port';
import { NotFoundException } from '@nestjs/common';
import { Vehicle } from '@domain/entities/vehicle.entity';

describe('DeleteVehicleUseCase', () => {
  let useCase: DeleteVehicleUseCase;
  let vehicleRepository: jest.Mocked<VehicleRepositoryPort>;

  const mockVehicle = new Vehicle({
    id: '123',
    licensePlate: 'ABC1234',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2023,
    customerId: 'customer-123',
  });

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteVehicleUseCase,
        {
          provide: VehicleRepositoryPort,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteVehicleUseCase>(DeleteVehicleUseCase);
    vehicleRepository = module.get(VehicleRepositoryPort);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should deactivate vehicle (soft delete)', async () => {
    vehicleRepository.findById.mockResolvedValue(mockVehicle);
    vehicleRepository.update.mockResolvedValue(mockVehicle);

    await useCase.execute('123');

    expect(vehicleRepository.findById).toHaveBeenCalledWith('123');
    expect(vehicleRepository.update).toHaveBeenCalledWith('123', expect.any(Vehicle));
  });

  it('should throw NotFoundException when vehicle not found', async () => {
    vehicleRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('999')).rejects.toThrow(NotFoundException);
  });
});
