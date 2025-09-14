import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateClassDto {
  @IsOptional() @IsString() @MaxLength(20)
  code?: string;

  @IsOptional() @IsString() @MaxLength(120)
  name?: string;

  @IsOptional() @IsInt() @Min(1)
  grade_level_id?: number;

  // معمولاً تغییر نمی‌دهیم، اما اگر لازم شد:
  @IsOptional() @IsInt() @Min(1)
  academic_year_id?: number;
}
