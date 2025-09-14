import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { EnrollmentStatus } from '../enrollment.entity';

export class UpdateEnrollmentDto {
  @IsOptional() @IsInt()
  class_id?: number;

  @IsOptional() @IsEnum(['active', 'deferred', 'expelled', 'graduated'])
  status?: EnrollmentStatus;
}
