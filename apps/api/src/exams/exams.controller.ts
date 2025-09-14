import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamTitleDto } from './dto/create-exam-title.dto';
import { UpdateExamTitleDto } from './dto/update-exam-title.dto';

@Controller('api/exams')
export class ExamsController {
  constructor(private readonly service: ExamsService) {}

  @Get()
  list() {
    return this.service.findAllForCurrentYear();
  }

  @Post()
  create(@Body() dto: CreateExamTitleDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExamTitleDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}