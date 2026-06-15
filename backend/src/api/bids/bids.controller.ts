import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { Authorization, Authorized } from 'src/common/decorators';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';

@Controller('lots/:lotId/bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @ApiOperation({ summary: 'Список ставок лота' })
  @ApiOkResponse({ description: 'Масив ставок' })
  @Get('all')
  findAll(
    @Param('lotId') lotId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '12',
  ) {
    return this.bidsService.findByLot(lotId, Number(page), Number(limit));
  }

  @ApiOperation({ summary: 'Зробити ставку' })
  @ApiCreatedResponse({ description: 'Ставку прийнято' })
  @ApiBearerAuth()
  @Authorization()
  @Post()
  create(
    @Param('lotId') lotId: string,
    @Authorized('id') userId: string,
    @Body() dto: CreateBidDto,
  ) {
    return this.bidsService.create(lotId, userId, dto);
  }
}
