import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateExamTitleDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;
}