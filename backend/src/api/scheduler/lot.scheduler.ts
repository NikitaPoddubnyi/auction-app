import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { LotStatus } from '@prisma/client';
import { AuctionGateway } from '../gateway/auction.gateway';

@Injectable()
export class LotScheduler {
  private readonly logger = new Logger(LotScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: AuctionGateway,
  ) {}

  @Cron('*/1 * * * *')
  async closeExpiredLots() {
    const expiredLots = await this.prisma.lot.findMany({
      where: {
        status: LotStatus.ACTIVE,
        endTime: { lte: new Date() },
      },
      include: {
        bids: {
          orderBy: { amount: 'desc' },
        },
      },
    });

    if (expiredLots.length === 0) return;

    this.logger.log(`Closing ${expiredLots.length} expired lot(s)`);

    for (const lot of expiredLots) {
      const winnerBid = lot.bids[0];

      const updatedLot = await this.prisma.lot.update({
        where: { id: lot.id },
        data: {
          status: LotStatus.CLOSED,
          winnerId: winnerBid?.bidderId ?? null,
          currentPrice: winnerBid?.amount ?? lot.startPrice,
        },
        include: {
          winner: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      this.gateway.notifyLotClosed(lot.id, {
        finalPrice: updatedLot.currentPrice.toNumber(),
        winner: updatedLot.winner ?? null,
      });

      this.logger.log(
        `Lot ${lot.id} closed. Winner: ${winnerBid?.bidderId ?? 'no bids'}`,
      );
    }
  }
}
