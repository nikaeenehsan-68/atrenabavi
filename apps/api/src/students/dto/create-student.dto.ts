// apps/api/src/students/dto/create-student.dto.ts
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum Guardian {
  Father = 'father',
  Mother = 'mother',
  Other = 'other',
}

// هر رشته‌ی خالی یا null → undefined تا @IsOptional فعال شود
const ToUndefinedIfEmpty = () =>
  Transform(({ value }) => (value === '' || value === null ? undefined : value));

export class CreateStudentDto {
  // --- دانش‌آموز (الزامی) ---
  @IsString() @IsNotEmpty() @MaxLength(100)
  first_name: string;

  @IsString() @IsNotEmpty() @MaxLength(100)
  last_name: string;

   @Matches(/^\d{10}$/, { message: 'کد ملی دانش‌آموز باید 10 رقم باشد' })
  national_code: string;

  // --- دانش‌آموز (اختیاری) ---
  @IsOptional() @IsString() @MaxLength(50) @ToUndefinedIfEmpty()
  birth_certificate_no?: string;

  @IsOptional() @IsString() @MaxLength(100) @ToUndefinedIfEmpty()
  birth_certificate_place?: string;

  @IsOptional() @IsString() @MaxLength(100) @ToUndefinedIfEmpty()
  birth_certificate_id?: string;

  @IsOptional() @IsDateString() @ToUndefinedIfEmpty()
  birth_date?: string;

  @IsOptional() @IsString() @MaxLength(100) @ToUndefinedIfEmpty()
  birth_place?: string;

  @IsOptional() @IsString() @MaxLength(255) @ToUndefinedIfEmpty()
  photo?: string;

  // --- پدر (الزامی/اختیاری) ---
  @IsString() @IsNotEmpty() @MaxLength(100)
  father_name: string;

  @Matches(/^\d{10}$/)
  father_national_code: string;

  @IsOptional() @IsDateString() @ToUndefinedIfEmpty()
  father_birth_date?: string;

  @IsOptional() @Matches(/^09\d{9}$/) @ToUndefinedIfEmpty()
  father_mobile?: string;

  @IsOptional() @IsString() @MaxLength(100) @ToUndefinedIfEmpty()
  father_birth_certificate_place?: string;

  @IsOptional() @IsString() @MaxLength(100) @ToUndefinedIfEmpty()
  father_education?: string;

  @IsOptional() @IsString() @MaxLength(100) @ToUndefinedIfEmpty()
  father_job?: string;

  // --- مادر (الزامی/اختیاری) ---
  @IsString() @IsNotEmpty() @MaxLength(100)
  mother_first_name: string;

  @IsString() @IsNotEmpty() @MaxLength(100)
  mother_last_name: string;

  @Matches(/^\d{10}$/)
  mother_national_code: string;

  @IsOptional() @IsDateString() @ToUndefinedIfEmpty()
  mother_birth_date?: string;

  @IsOptional() @Matches(/^09\d{9}$/) @ToUndefinedIfEmpty()
  mother_mobile?: string;

  @IsOptional() @IsString() @MaxLength(100) @ToUndefinedIfEmpty()
  mother_education?: string;

  @IsOptional() @IsString() @MaxLength(100) @ToUndefinedIfEmpty()
  mother_job?: string;

  // --- سایر ---
  @IsEnum(Guardian)
  guardian: Guardian;

  @IsOptional() @IsString() @ToUndefinedIfEmpty()
  address?: string;

  @IsOptional() @IsString() @MaxLength(20) @ToUndefinedIfEmpty()
  home_phone?: string;

  @IsOptional() @IsString() @MaxLength(50) @ToUndefinedIfEmpty()
  status?: string;
}
