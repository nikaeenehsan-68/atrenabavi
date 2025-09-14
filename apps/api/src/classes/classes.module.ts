import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassEntity } from './class.entity';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { GradeLevel } from '../grade-levels/grade-level.entity';
import { AcademicYear } from '../academic-years/academic-year.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClassEntity, GradeLevel, AcademicYear])],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
