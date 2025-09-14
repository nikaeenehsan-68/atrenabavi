import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, Query } from '@nestjs/common';
import { TextbooksService } from './textbooks.service';
import { CreateTextbookDto } from './dto/create-textbook.dto';
import { UpdateTextbookDto } from './dto/update-textbook.dto';

@Controller('api/textbooks')
export class TextbooksController {
  constructor(private readonly service: TextbooksService) {}

  @Get()
  findAll(
    @Query('academic_year_id') academic_year_id?: string,
    @Query('current') current?: string,
  ) {
    const yearId = academic_year_id ? Number(academic_year_id) : undefined;
    const onlyCurrent = current === '1' || current === 'true';
    return this.service.findAll(yearId, onlyCurrent);
  }

  @Post()
  create(@Body() dto: CreateTextbookDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTextbookDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
