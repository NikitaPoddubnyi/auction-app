import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LotStatus } from '@prisma/client';
import { LotsService } from './lots.service';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CloudinaryService } from '../../infra/claudinary/claudinary.service';

const mockLot = {
  id: 'lot-1',
  title: 'Test Lot',
  description: 'Test description',
  startPrice: 100,
  currentPrice: 100,
  endTime: new Date(Date.now() + 3600000),
  status: LotStatus.ACTIVE,
  creatorId: 'user-1',
  winnerId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  creator: { id: 'user-1', firstName: 'Олег', lastName: 'Іванов' },
  logo: { url: 'https://res.cloudinary.com/test/logo.jpg' },
} as any;

const mockPrisma = {
  lot: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
  },
};

const mockCloudinary = {
  uploadLotLogo: jest.fn(),
};

describe('LotsService', () => {
  let service: LotsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LotsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CloudinaryService, useValue: mockCloudinary },
      ],
    }).compile();

    service = module.get<LotsService>(LotsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto = {
      title: 'Test Lot',
      description: 'Test',
      startPrice: 100,
      endTime: new Date(Date.now() + 3600000).toISOString(),
    };

    it('створює лот без фото', async () => {
      mockPrisma.lot.create.mockResolvedValue(mockLot);

      const result = await service.create('user-1', dto);

      expect(result).toEqual(mockLot);
      expect(mockPrisma.lot.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Test Lot',
            creatorId: 'user-1',
            currentPrice: 100,
          }),
        }),
      );
    });

    it('створює лот з фото через Cloudinary', async () => {
      const mockFile = { buffer: Buffer.from('test') } as Express.Multer.File;
      mockCloudinary.uploadLotLogo.mockResolvedValue({
        secure_url: 'https://cloudinary.com/test.jpg',
      });
      mockPrisma.lot.create.mockResolvedValue({
        ...mockLot,
        logo: { url: 'https://cloudinary.com/test.jpg' },
      } as any);

      const result = (await service.create('user-1', dto, mockFile)) as any;

      expect(mockCloudinary.uploadLotLogo).toHaveBeenCalledWith(mockFile);
      expect(result.logo.url).toBeDefined();
    });

    it('кидає BadRequestException якщо endTime в минулому', async () => {
      await expect(
        service.create('user-1', {
          ...dto,
          endTime: new Date(Date.now() - 1000).toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrisma.lot.create).not.toHaveBeenCalled();
    });

    it('не викликає Cloudinary якщо файл не передано', async () => {
      mockPrisma.lot.create.mockResolvedValue(mockLot);

      await service.create('user-1', dto);

      expect(mockCloudinary.uploadLotLogo).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('повертає список активних лотів з пагінацією', async () => {
      mockPrisma.lot.findMany.mockResolvedValue([mockLot]);
      mockPrisma.lot.count.mockResolvedValue(1);

      const result = await service.findAll(1, 12);

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual(mockLot);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 12,
        totalPages: 1,
      });
    });

    it('повертає порожній список якщо лотів немає', async () => {
      mockPrisma.lot.findMany.mockResolvedValue([]);
      mockPrisma.lot.count.mockResolvedValue(0);

      const result = await service.findAll(1, 12);

      expect(result.items).toHaveLength(0);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });

    it('правильно рахує totalPages', async () => {
      mockPrisma.lot.findMany.mockResolvedValue(Array(12).fill(mockLot));
      mockPrisma.lot.count.mockResolvedValue(25);

      const result = await service.findAll(1, 12);

      expect(result.meta.totalPages).toBe(3);
    });

    it('правильно обчислює skip для другої сторінки', async () => {
      mockPrisma.lot.findMany.mockResolvedValue([]);
      mockPrisma.lot.count.mockResolvedValue(0);

      await service.findAll(2, 12);

      expect(mockPrisma.lot.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 12, take: 12 }),
      );
    });
  });

  describe('findOne', () => {
    it('повертає лот за id', async () => {
      mockPrisma.lot.findUnique.mockResolvedValue(mockLot);

      const result = await service.findOne('lot-1');

      expect(result).toEqual(mockLot);
      expect(mockPrisma.lot.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'lot-1' } }),
      );
    });

    it('кидає NotFoundException якщо лот не знайдено', async () => {
      mockPrisma.lot.findUnique.mockResolvedValue(null);

      await expect(service.findOne('lot-999')).rejects.toThrow(NotFoundException);
    });
  });
});