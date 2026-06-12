import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Lot, LotStatus } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateLotDto } from './dto';
import { CloudinaryService } from 'src/infra/claudinary/claudinary.service';

@Injectable()
export class LotsService {
  constructor(private readonly prisma: PrismaService, private readonly cloudinaryService: CloudinaryService) {}

async create(
  creatorId: string,
  dto: CreateLotDto,
  file?: Express.Multer.File,
): Promise<Lot> {
  const endTime = new Date(dto.endTime);
  if (endTime <= new Date()) {
    throw new BadRequestException('endTime must be in the future');
  }

  let logoUrl: string | undefined;
  if (file) {
    const uploaded = await this.cloudinaryService.uploadLotLogo(file);
    logoUrl = uploaded.secure_url;
  }

  return this.prisma.lot.create({
    data: {
      title: dto.title,
      description: dto.description,
      startPrice: dto.startPrice,
      currentPrice: dto.startPrice,
      endTime,
      creatorId,

      ...(logoUrl && {
        logo: {
          create: { url: logoUrl },
        },
      }),
    },
    include: {
      creator: { select: { id: true, firstName: true, lastName: true } },
      logo: true,
    },
  });
}

  async findAll(page = 1, limit = 12): Promise<{items: Lot[], meta: any}> {
	const skip = (page - 1) * limit;
	
	const [items, total] = await Promise.all([
		this.prisma.lot.findMany({
			where: { status: LotStatus.ACTIVE },
			orderBy: { createdAt: 'desc' },
			skip,
			take: limit,
			include: {
				creator: { select: { id: true, firstName: true, lastName: true } },
				_count: { select: { bids: true } },
			},
		}),
		this.prisma.lot.count({
		where: { status: LotStatus.ACTIVE },
		}),
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

  async findOne(id: string): Promise<Lot> {
    const lot = await this.prisma.lot.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true } },
        winner: { select: { id: true, firstName: true, lastName: true } },
        bids: {
          orderBy: { createdAt: 'desc' },
          include: {
            bidder: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!lot) throw new NotFoundException('Lot not found');
    return lot;
  }
}