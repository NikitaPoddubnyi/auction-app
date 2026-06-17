import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { LotStatus } from '@prisma/client';
import { BidsService } from './bids.service';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { AuctionGateway } from '../gateway/auction.gateway';

const mockLot = {
  id: 'lot-1',
  title: 'Test Lot',
  status: LotStatus.ACTIVE,
  currentPrice: 100,
  startPrice: 100,
  endTime: new Date(Date.now() + 3600000),
};

const mockBidder = {
  id: 'user-1',
  firstName: 'Олег',
  lastName: 'Іванов',
};

const mockBid = {
  id: 'bid-1',
  amount: 200,
  lotId: 'lot-1',
  bidderId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  bidder: mockBidder,
};

const mockPrisma = {
  lot: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  bid: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
  },
};

const mockGateway = {
  notifyNewBid: jest.fn(),
};

describe('BidsService', () => {
  let service: BidsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BidsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuctionGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<BidsService>(BidsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    beforeEach(() => {
      mockPrisma.lot.findUnique.mockResolvedValue(mockLot);
      mockPrisma.bid.findFirst.mockResolvedValue(null);
      mockPrisma.bid.create.mockResolvedValue(mockBid);
      mockPrisma.lot.update.mockResolvedValue({
        ...mockLot,
        currentPrice: 200,
      });
    });

    it('створює ставку і повертає bid з bidder', async () => {
      const result = await service.create('lot-1', 'user-1', { amount: 200 });

      expect(result).toEqual(mockBid);
    });

    it('оновлює currentPrice лота', async () => {
      await service.create('lot-1', 'user-1', { amount: 200 });

      expect(mockPrisma.lot.update).toHaveBeenCalledWith({
        where: { id: 'lot-1' },
        data: { currentPrice: 200 },
      });
    });

    it('надсилає WebSocket подію newBid', async () => {
      await service.create('lot-1', 'user-1', { amount: 200 });

      expect(mockGateway.notifyNewBid).toHaveBeenCalledWith('lot-1', {
        amount: mockBid.amount,
        createdAt: mockBid.createdAt,
        bidder: mockBid.bidder,
      });
    });

    it('кидає NotFoundException якщо лот не знайдено', async () => {
      mockPrisma.lot.findUnique.mockResolvedValue(null);

      await expect(
        service.create('lot-1', 'user-1', { amount: 200 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('кидає ConflictException якщо лот закритий', async () => {
      mockPrisma.lot.findUnique.mockResolvedValue({
        ...mockLot,
        status: LotStatus.CLOSED,
      });

      await expect(
        service.create('lot-1', 'user-1', { amount: 200 }),
      ).rejects.toThrow(ConflictException);
    });

    it('кидає ConflictException якщо час лота вийшов', async () => {
      mockPrisma.lot.findUnique.mockResolvedValue({
        ...mockLot,
        endTime: new Date(Date.now() - 1000),
      });

      await expect(
        service.create('lot-1', 'user-1', { amount: 200 }),
      ).rejects.toThrow(ConflictException);
    });

    it('кидає BadRequestException якщо ставка менша за поточну', async () => {
      await expect(
        service.create('lot-1', 'user-1', { amount: 50 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('кидає BadRequestException якщо ставка рівна поточній', async () => {
      await expect(
        service.create('lot-1', 'user-1', { amount: 100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('не викликає gateway якщо ставка не пройшла валідацію', async () => {
      await expect(
        service.create('lot-1', 'user-1', { amount: 50 }),
      ).rejects.toThrow();

      expect(mockGateway.notifyNewBid).not.toHaveBeenCalled();
    });
  });

  describe('findByLot', () => {
    it('повертає ставки з пагінацією', async () => {
      mockPrisma.bid.findMany.mockResolvedValue([mockBid]);
      mockPrisma.bid.count.mockResolvedValue(1);

      const result = await service.findByLot('lot-1', 1, 12);

      expect(result.items).toHaveLength(1);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 12,
        totalPages: 1,
      });
    });

    it('повертає порожній список якщо ставок немає', async () => {
      mockPrisma.bid.findMany.mockResolvedValue([]);
      mockPrisma.bid.count.mockResolvedValue(0);

      const result = await service.findByLot('lot-1', 1, 12);

      expect(result.items).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it('правильно обчислює skip для другої сторінки', async () => {
      mockPrisma.bid.findMany.mockResolvedValue([]);
      mockPrisma.bid.count.mockResolvedValue(0);

      await service.findByLot('lot-1', 2, 12);

      expect(mockPrisma.bid.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 12, take: 12 }),
      );
    });
  });
});