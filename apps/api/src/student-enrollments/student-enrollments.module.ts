// apps/api/src/student-enrollments/student-enrollments.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentEnrollment } from './student-enrollment.entity';
import { StudentEnrollmentsService } from './student-enrollments.service';
import { StudentEnrollmentsController } from './student-enrollments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StudentEnrollment])],
  providers: [StudentEnrollmentsService],
  controllers: [StudentEnrollmentsController],
  exports: [StudentEnrollmentsService],
})
export class StudentEnrollmentsModule {}
