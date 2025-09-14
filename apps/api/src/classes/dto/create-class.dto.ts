import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateClassDto {
  @IsString() @IsNotEmpty() @MaxLength(20)
  code: string;

  @IsString() @IsNotEmpty() @MaxLength(120)
  name: string;

  @IsInt() @Min(1)
  grade_level_id: number;

  // ارسال از فرانت می‌آید، اگر نبود در سرویس روی سال جاری ست می‌شود
  @IsOptional() @IsInt() @Min(1)
  academic_year_id?: number;
}
