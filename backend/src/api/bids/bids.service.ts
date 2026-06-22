import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Bid, LotStatus } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { AuctionGateway } from '../gateway/auction.gateway';

@Injectable()
export class BidsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: AuctionGateway,
  ) {}

  async create(
    lotId: string,
    bidderId: string,
    dto: CreateBidDto,
  ): Promise<Bid> {
    const lot = await this.prisma.lot.findUnique({ where: { id: lotId } });

    if (!lot) throw new NotFoundException('Lot not found');
    if (lot.status === LotStatus.CLOSED) throw new ConflictException('Lot is already closed');
    if (lot.endTime <= new Date()) throw new ConflictException('Lot has expired');
    if (bidderId === lot.creatorId) throw new ConflictException('You cannot bid on your own lot');

    const lastBid = await this.prisma.bid.findFirst({
      where: { lotId },
      orderBy: { createdAt: 'desc' },
      select: { bidderId: true },
    });

    if (lastBid?.bidderId === bidderId) {
      throw new ConflictException('You cannot outbid yourself. Wait for another user to bid.');
    }

    if (dto.amount <= lot.currentPrice.toNumber()) {
      throw new BadRequestException(
        `Bid must be greater than current price: ${lot.currentPrice}`,
      );
    }

    const [updatedCount, bid] = await this.prisma.$transaction([
      this.prisma.lot.updateMany({
        where: {
          id: lotId,
          status: LotStatus.ACTIVE,
          endTime: { gt: new Date() },
          currentPrice: { lt: dto.amount }, 
        },
        data: { currentPrice: dto.amount },
      }),
      this.prisma.bid.create({
        data: {
          amount: dto.amount,
          lotId,
          bidderId,
        },
        include: {
          bidder: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
    ]);

    if (updatedCount.count === 0) {
      await this.prisma.bid.delete({ where: { id: bid.id } });
      throw new ConflictException(
        'Bid was outpaced by another user. Please try again with a higher amount.',
      );
    }

    this.gateway.notifyNewBid(lotId, {
      amount: bid.amount?.toNumber() || 0,
      createdAt: bid.createdAt,
      bidder: bid.bidder,
    });

    return bid;
  }

  async findByLot(
    lotId: string,
    page = 1,
    limit = 12,
  ): Promise<{ items: Bid[]; meta: any }> {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.bid.findMany({
        where: { lotId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          bidder: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.bid.count({ where: { lotId } }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}