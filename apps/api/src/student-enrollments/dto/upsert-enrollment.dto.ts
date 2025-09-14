// apps/api/src/student-enrollments/dto/upsert-enrollment.dto.ts
import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpsertEnrollmentDto {
  @Type(() => Number) @IsInt()
  student_id: number;

  @Type(() => Number) @IsInt()
  academic_year_id: number;

  @IsOptional() @Type(() => Number) @IsInt()
  class_id?: number | null; // null = بدون کلاس
}
