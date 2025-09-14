import { IsOptional, IsString, MaxLength, IsIn } from 'class-validator';
import { TERM_STATUSES } from './create-academic-term.dto';

export class UpdateAcademicTermDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @IsIn(TERM_STATUSES as unknown as string[])
  status?: string;
}
