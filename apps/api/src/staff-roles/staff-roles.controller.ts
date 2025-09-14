// apps/api/src/staff-roles/staff-roles.controller.ts
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { StaffRolesService } from './staff-roles.service';
import { CreateStaffRoleDto } from './dto/create-staff-role.dto';
import { UpdateStaffRoleDto } from './dto/update-staff-role.dto';

@Controller('api/staff-roles')
export class StaffRolesController {
  constructor(private readonly service: StaffRolesService) {}

  @Get()
  findAll() {
    return this.service.findAllForCurrentYear();
  }

  @Get('meta')
  meta() {
    return this.service.metaForCurrentYear();
  }

  @Post()
  create(@Body() dto: CreateStaffRoleDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStaffRoleDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
