import { Vehicle } from '@domain/entities/vehicle.entity';
import { UpdateVehicleUseCase } from '@application/use-cases/vehicle/update-vehicle.use-case';
import { Test, TestingModule } from '@nestjs/testing';
import { ListVehiclesUseCase } from '@application/use-cases/vehicle/list-vehicles.use-case';
import { GetVehicleUseCase } from '@application/use-cases/vehicle/get-vehicle.use-case';
import { DeleteVehicleUseCase } from '@application/use-cases/vehicle/delete-vehicle.use-case';
import { CreateVehicleUseCase } from '@application/use-cases/vehicle/create-vehicle.use-case';

import { VehicleController } from './vehicle.controller';

const vehicleDto = {
  customerId: 'customer-id',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2020,
  licensePlate: 'ABC-1234',
  color: 'White',
};

const vehicle = new Vehicle({
  id: 'vehicle-1',
  customerId: 'customer-id',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2020,
  licensePlate: 'ABC-1234',
  color: 'White',
});

describe('VehicleController', () => {
  let controller: VehicleController;

  const mockCreateVehicleUseCase = {
    execute: jest.fn(),
  };

  const mockGetVehicleUseCase = {
    execute: jest.fn(),
  };

  const mockListVehiclesUseCase = {
    execute: jest.fn(),
  };

  const mockUpdateVehicleUseCase = {
    execute: jest.fn(),
  };

  const mockDeleteVehicleUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [
        {
          provide: CreateVehicleUseCase,
          useValue: mockCreateVehicleUseCase,
        },
        {
          provide: GetVehicleUseCase,
          useValue: mockGetVehicleUseCase,
        },
        {
          provide: ListVehiclesUseCase,
          useValue: mockListVehiclesUseCase,
        },
        {
          provide: UpdateVehicleUseCase,
          useValue: mockUpdateVehicleUseCase,
        },
        {
          provide: DeleteVehicleUseCase,
          useValue: mockDeleteVehicleUseCase,
        },
      ],
    }).compile();

    controller = module.get<VehicleController>(VehicleController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a vehicle', async () => {
      mockCreateVehicleUseCase.execute.mockResolvedValue(vehicle);

      const result = await controller.create(vehicleDto);

      expect(result).toEqual(vehicle);
      expect(mockCreateVehicleUseCase.execute).toHaveBeenCalledWith(vehicleDto);
    });
  });

  describe('findAll', () => {
    it('should list vehicles without filters', async () => {
      mockListVehiclesUseCase.execute.mockResolvedValue([vehicle]);

      const result = await controller.findAll();

      expect(result).toEqual([vehicle]);
      expect(mockListVehiclesUseCase.execute).toHaveBeenCalledWith({});
    });

    it('should list vehicles with filters', async () => {
      mockListVehiclesUseCase.execute.mockResolvedValue([vehicle]);

      const result = await controller.findAll('customer-id', 'true');

      expect(result).toEqual([vehicle]);
      expect(mockListVehiclesUseCase.execute).toHaveBeenCalledWith({
        customerId: 'customer-id',
        active: true,
      });
    });
  });

  describe('findOne', () => {
    it('should get a vehicle by id', async () => {
      mockGetVehicleUseCase.execute.mockResolvedValue(vehicle);

      const result = await controller.findOne('vehicle-id');

      expect(result).toEqual(vehicle);
      expect(mockGetVehicleUseCase.execute).toHaveBeenCalledWith('vehicle-id');
    });
  });

  describe('update', () => {
    it('should update a vehicle', async () => {
      const updateDto = {
        color: 'Black',
      };

      mockUpdateVehicleUseCase.execute.mockResolvedValue(vehicle);

      const result = await controller.update('vehicle-id', updateDto);

      expect(result).toEqual(vehicle);
      expect(mockUpdateVehicleUseCase.execute).toHaveBeenCalledWith('vehicle-id', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a vehicle', async () => {
      await controller.remove('vehicle-id');

      expect(mockDeleteVehicleUseCase.execute).toHaveBeenCalledWith('vehicle-id');
    });
  });
});
