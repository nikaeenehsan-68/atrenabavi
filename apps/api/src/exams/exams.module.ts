import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { ExamTitle } from './exam-title.entity';
import { AcademicYear } from '../academic-years/academic-year.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExamTitle, AcademicYear])],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [TypeOrmModule],
})
export class ExamsModule {}