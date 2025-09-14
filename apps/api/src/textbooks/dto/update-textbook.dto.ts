import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateTextbookDto {
  @IsOptional() @IsString() @MaxLength(120)
  name?: string;

  @IsOptional() @IsInt() @Min(1)
  grade_level_id?: number;

  @IsOptional() @IsInt() @Min(1)
  academic_year_id?: number;
}
