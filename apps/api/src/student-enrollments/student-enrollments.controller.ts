// apps/api/src/student-enrollments/student-enrollments.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Put,
  Query,
} from '@nestjs/common';
import { StudentEnrollmentsService } from './student-enrollments.service';
import { FindEnrollmentsDto } from './dto/find-enrollments.dto';
import { UpsertEnrollmentDto } from './dto/upsert-enrollment.dto';

@Controller('api/student-enrollments')
export class StudentEnrollmentsController {
  constructor(private readonly svc: StudentEnrollmentsService) {}

  // لیست‌گیری با فیلترهای اختیاری: ?academic_year_id=&class_id=&student_id=&status=
  @Get()
  list(@Query() q: FindEnrollmentsDto) {
    return this.svc.findAll(q);
  }

  // تغییر/ساخت ثبت‌نام سال جاری یک دانش‌آموز (idempotent)
  // body: { student_id, academic_year_id, class_id|null, status? }
  @Put('upsert')
  upsert(@Body() dto: UpsertEnrollmentDto) {
    return this.svc.upsert(dto);
  }

  // ویرایش یک ثبت‌نام مشخص (مثلاً تغییر class_id)
  @Patch(':id')
  patch(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<UpsertEnrollmentDto>) {
    return this.svc.update(id, body);
  }

  // حذف نرمِ ثبت‌نام (student_enrollments.deleted_at را پر می‌کند)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.softDelete(id);
  }
}
