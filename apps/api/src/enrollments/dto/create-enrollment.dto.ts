import { IsEnum, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { EnrollmentStatus } from '../enrollment.entity';

export class CreateEnrollmentDto {
  @IsInt() @IsNotEmpty()
  student_id: number;

  @IsInt() @IsNotEmpty()
  class_id: number;

  @IsOptional() @IsEnum(['active', 'deferred', 'expelled', 'graduated'])
  status?: EnrollmentStatus;
}
