import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeLevel } from './grade-level.entity';
import { GradeLevelsService } from './grade-levels.service';
import { GradeLevelsController } from './grade-levels.controller';
import { AcademicTerm } from '../academic-terms/academic-term.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GradeLevel, AcademicTerm])],
  controllers: [GradeLevelsController],
  providers: [GradeLevelsService],
  exports: [GradeLevelsService],
})
export class GradeLevelsModule {}
