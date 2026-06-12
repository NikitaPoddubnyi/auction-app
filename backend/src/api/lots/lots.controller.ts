import { Body, Controller, Get, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { Authorization, Authorized} from 'src/common/decorators';
import { CreateLotDto } from './dto/create-lot.dto';
import { LotsService } from './lots.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('lots')
export class LotsController {
  constructor(private readonly lotsService: LotsService) {}

  @ApiOperation({ summary: 'Список активних лотів' })
  @ApiOkResponse({ description: 'Масив активних лотів' })
  @Get('all')
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 12
  ) {
    return this.lotsService.findAll(page, limit);
  }

  @ApiOperation({ summary: 'Деталі лота' })
  @ApiOkResponse({ description: 'Лот з усіма ставками' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lotsService.findOne(id);
  }

  @ApiOperation({ summary: 'Створити лот' })
  @ApiCreatedResponse({ description: 'Лот створено' })
  @ApiBearerAuth() @Authorization()
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Authorized('id') userId: string,
    @Body() dto: CreateLotDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.lotsService.create(userId, dto, file);
  }
}