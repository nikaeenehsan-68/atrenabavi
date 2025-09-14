import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateTextbookDto {
  @IsString() @IsNotEmpty() @MaxLength(120)
  name: string;

  @IsInt() @Min(1)
  grade_level_id: number;

  // اگر ارسال نشود، در سرویس روی سال جاری ست می‌شود
  @IsOptional() @IsInt() @Min(1)
  academic_year_id?: number;
}
