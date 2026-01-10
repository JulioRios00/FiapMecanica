import { UpdatePartUseCase } from '@application/use-cases/part/update-part.use-case';
import { Test, TestingModule } from '@nestjs/testing';
import { Part } from '@domain/entities/part.entity';
import { ListPartsUseCase } from '@application/use-cases/part/list-parts.use-case';
import { GetPartUseCase } from '@application/use-cases/part/get-part.use-case';
import { DeletePartUseCase } from '@application/use-cases/part/delete-part.use-case';
import { CreatePartUseCase } from '@application/use-cases/part/create-part.use-case';

import { PartController } from './part.controller';

const partDto = {
  name: 'Brake Pad',
  partNumber: 'BP-001',
  description: 'Front brake pad',
  price: 150.0,
  stockQuantity: 10,
  minStockLevel: 5,
};

const part = new Part({
  id: 'part-1',
  ...partDto,
});

describe('PartController', () => {
  let controller: PartController;

  const mockCreatePartUseCase = {
    execute: jest.fn(),
  };

  const mockGetPartUseCase = {
    execute: jest.fn(),
  };

  const mockListPartsUseCase = {
    execute: jest.fn(),
  };

  const mockUpdatePartUseCase = {
    execute: jest.fn(),
  };

  const mockDeletePartUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartController],
      providers: [
        {
          provide: CreatePartUseCase,
          useValue: mockCreatePartUseCase,
        },
        {
          provide: GetPartUseCase,
          useValue: mockGetPartUseCase,
        },
        {
          provide: ListPartsUseCase,
          useValue: mockListPartsUseCase,
        },
        {
          provide: UpdatePartUseCase,
          useValue: mockUpdatePartUseCase,
        },
        {
          provide: DeletePartUseCase,
          useValue: mockDeletePartUseCase,
        },
      ],
    }).compile();

    controller = module.get<PartController>(PartController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a part', async () => {
      mockCreatePartUseCase.execute.mockResolvedValue(part);

      const result = await controller.create(partDto);

      expect(result).toEqual(part);
      expect(mockCreatePartUseCase.execute).toHaveBeenCalledWith(partDto);
    });
  });

  describe('findAll', () => {
    it('should list parts without filters', async () => {
      mockListPartsUseCase.execute.mockResolvedValue([part]);

      const result = await controller.findAll();

      expect(result).toEqual([part]);
      expect(mockListPartsUseCase.execute).toHaveBeenCalledWith({});
    });

    it('should list parts with filters', async () => {
      mockListPartsUseCase.execute.mockResolvedValue([part]);

      const result = await controller.findAll('true', 'true');

      expect(result).toEqual([part]);
      expect(mockListPartsUseCase.execute).toHaveBeenCalledWith({
        active: true,
        lowStock: true,
      });
    });
  });

  describe('findOne', () => {
    it('should get a part by id', async () => {
      mockGetPartUseCase.execute.mockResolvedValue(part);

      const result = await controller.findOne('part-id');

      expect(result).toEqual(part);
      expect(mockGetPartUseCase.execute).toHaveBeenCalledWith('part-id');
    });
  });

  describe('update', () => {
    it('should update a part', async () => {
      const updateDto = {
        name: 'Updated Brake Pad',
      };

      mockUpdatePartUseCase.execute.mockResolvedValue(part);

      const result = await controller.update('part-id', updateDto);

      expect(result).toEqual(part);
      expect(mockUpdatePartUseCase.execute).toHaveBeenCalledWith('part-id', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a part', async () => {
      await controller.remove('part-id');

      expect(mockDeletePartUseCase.execute).toHaveBeenCalledWith('part-id');
    });
  });
});
