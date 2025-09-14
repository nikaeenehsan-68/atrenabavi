// apps/api/src/staff-roles/dto/create-staff-role.dto.ts
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateStaffRoleDto {
  @IsInt() @IsNotEmpty()
  user_id: number;

  @IsInt() @IsNotEmpty()
  role_id: number; // 1=teacher, 2=assistant

  @IsOptional() @IsInt()
  class_id?: number;

  @IsOptional() @IsInt()
  academic_term_id?: number;
}
