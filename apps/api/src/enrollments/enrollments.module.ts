import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from './enrollment.entity';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { AcademicYear } from '../academic-years/academic-year.entity';
import { Student } from '../students/student.entity';
import { ClassEntity } from '../classes/class.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Enrollment, AcademicYear, Student, ClassEntity])],
  providers: [EnrollmentsService],
  controllers: [EnrollmentsController],
})
export class EnrollmentsModule {}
