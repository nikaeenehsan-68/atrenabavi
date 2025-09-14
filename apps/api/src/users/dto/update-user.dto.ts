import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, Length, Matches, MaxLength, Min } from 'class-validator';

export class UpdateUserDto {
  @IsOptional() @IsString() @MaxLength(80)
  first_name?: string;

  @IsOptional() @IsString() @MaxLength(80)
  last_name?: string;

  @IsOptional() @Matches(/^\d{10}$/, { message: 'national_id باید ۱۰ رقم باشد' })
  national_id?: string;

  @IsOptional() @IsString() @MaxLength(64)
  username?: string;

  // اگر ارسال شود، در سرویس هش می‌شود
  @IsOptional() @IsString() @Length(6, 100)
  password?: string;

  @IsOptional() @MaxLength(20)
  phone?: string;

  @IsOptional() @IsDateString()
  birth_date?: string;

  @IsOptional() @MaxLength(120)
  birth_certificate_identifier?: string;

  @IsOptional() @MaxLength(120)
  birth_certificate_issue_place?: string;

  @IsOptional() @MaxLength(120)
  birth_place?: string;

  @IsOptional() @MaxLength(80)
  father_name?: string;

  @IsOptional() @MaxLength(80)
  mother_first_name?: string;

  @IsOptional() @MaxLength(80)
  mother_last_name?: string;

  @IsOptional() @MaxLength(80)
  spouse_first_name?: string;

  @IsOptional() @MaxLength(80)
  spouse_last_name?: string;

  @IsOptional() @MaxLength(20)
  spouse_mobile?: string;

  @IsOptional()
  home_address?: string;

  @IsOptional() @MaxLength(20)
  home_phone?: string;

  @IsOptional() @MaxLength(20)
  marital_status?: string;

  @IsOptional() @IsInt() @Min(0)
  children_count?: number;

  @IsOptional() @MaxLength(16)
  bank_card_number?: string;

  @IsOptional() @MaxLength(32)
  bank_account_number?: string;

  @IsOptional() @MaxLength(26)
  bank_sheba_number?: string;

  @IsOptional() @MaxLength(100)
  bank_name?: string;

  @IsOptional() @IsBoolean()
  is_active?: boolean;
}
