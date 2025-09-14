import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffRole } from './staff-role.entity';
import { StaffRolesService } from './staff-roles.service';
import { StaffRolesController } from './staff-roles.controller';
import { AcademicYear } from '../academic-years/academic-year.entity';
import { AcademicTerm } from '../academic-terms/academic-term.entity';
import { ClassEntity } from '../classes/class.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StaffRole, AcademicYear, AcademicTerm, ClassEntity, User])],
  providers: [StaffRolesService],
  controllers: [StaffRolesController],
})
export class StaffRolesModule {}
