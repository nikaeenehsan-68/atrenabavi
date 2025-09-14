// apps/api/src/student-enrollments/dto/find-enrollments.dto.ts
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FindEnrollmentsDto {
  @IsOptional() @Type(() => Number) @IsInt()
  academic_year_id?: number;

  @IsOptional() @Type(() => Number) @IsInt()
  class_id?: number;

  @IsOptional() @Type(() => Number) @IsInt()
  student_id?: number;

  @IsOptional() @IsString()
  status?: string; // 'active' و ... (اختیاری)
}
