import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicYear } from './academic-year.entity';
import { AcademicYearsService } from './academic-years.service';
import { AcademicYearsController } from './academic-years.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicYear])],
  providers: [AcademicYearsService],
  controllers: [AcademicYearsController],
})
export class AcademicYearsModule {}
