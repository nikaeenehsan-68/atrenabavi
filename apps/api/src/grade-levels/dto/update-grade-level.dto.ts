import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { GRADE_STATUSES } from './create-grade-level.dto';

export class UpdateGradeLevelDto {
  @IsOptional() @IsInt() @Min(1)
  academic_term_id?: number;

  @IsOptional() @IsString() @MaxLength(20)
  grade_code?: string;

  @IsOptional() @IsString() @MaxLength(120)
  name?: string;

  @IsOptional() @IsString() @IsIn(GRADE_STATUSES as unknown as string[])
  status?: string;
}
