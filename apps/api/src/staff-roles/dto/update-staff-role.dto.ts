// apps/api/src/staff-roles/dto/update-staff-role.dto.ts
import { IsInt, IsOptional } from 'class-validator';

export class UpdateStaffRoleDto {
  @IsOptional() @IsInt()
  role_id?: number;

  @IsOptional() @IsInt()
  class_id?: number;

  @IsOptional() @IsInt()
  academic_term_id?: number;
}
