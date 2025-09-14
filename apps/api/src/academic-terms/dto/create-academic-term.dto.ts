import { IsNotEmpty, IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

export const TERM_STATUSES = ['فعال', 'غیرفعال'] as const;
type TermStatus = (typeof TERM_STATUSES)[number];

export class CreateAcademicTermDto {
  @IsString()
  @IsNotEmpty({ message: 'نام دوره الزامی است' })
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  @IsIn(TERM_STATUSES as unknown as string[], { message: 'وضعیت نامعتبر است' })
  status?: TermStatus;
}
