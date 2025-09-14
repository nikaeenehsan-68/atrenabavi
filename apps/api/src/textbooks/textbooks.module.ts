import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Textbook } from './textbook.entity';
import { TextbooksService } from './textbooks.service';
import { TextbooksController } from './textbooks.controller';
import { GradeLevel } from '../grade-levels/grade-level.entity';
import { AcademicYear } from '../academic-years/academic-year.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Textbook, GradeLevel, AcademicYear])],
  controllers: [TextbooksController],
  providers: [TextbooksService],
  exports: [TextbooksService],
})
export class TextbooksModule {}
