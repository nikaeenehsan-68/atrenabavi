import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { AcademicYearsService } from './academic-years.service';

@Controller('academic-years')
export class AcademicYearsController {
  constructor(private readonly svc: AcademicYearsService) {}

  @Get()
  list() {
    return this.svc.findAll();
  }

  @Get('current')
  current() {
    return this.svc.findCurrent();
  }

  @Post()
  create(
    @Body()
    body: {
      title: string;
      start_date?: string;
      end_date?: string;
      is_current?: boolean;
    },
  ) {
    return this.svc.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.svc.update(Number(id), body);
  }

  @Patch(':id/current')
  setCurrent(@Param('id') id: string) {
    return this.svc.setCurrent(Number(id));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(Number(id));
  }
}
