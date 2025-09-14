import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
export const GRADE_STATUSES = ['فعال', 'غیرفعال'] as const;

export class CreateGradeLevelDto {
  @IsInt() @Min(1)
  academic_term_id: number;

  @IsString() @IsNotEmpty() @MaxLength(20)
  grade_code: string;

  @IsString() @IsNotEmpty() @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  @IsIn(GRADE_STATUSES as unknown as string[])
  status?: string;
}
