import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, Query } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Controller('api/classes')
export class ClassesController {
  constructor(private readonly service: ClassesService) {}

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
  create(@Body() dto: CreateClassDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClassDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
