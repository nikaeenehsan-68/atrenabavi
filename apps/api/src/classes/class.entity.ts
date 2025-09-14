import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
} from 'typeorm';
import { GradeLevel } from '../grade-levels/grade-level.entity';
import { AcademicYear } from '../academic-years/academic-year.entity';

@Entity({ name: 'classes' })
export class ClassEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, nullable: false })
  code: string;

  @Column({ type: 'varchar', length: 120, nullable: false })
  name: string;

  // FK: grade_levels
  @ManyToOne(() => GradeLevel, { nullable: false })
  @JoinColumn({ name: 'grade_level_id' })
  grade_level: GradeLevel;

  @Column({ name: 'grade_level_id', type: 'int' })
  grade_level_id: number;

  // FK: academic_years
  @ManyToOne(() => AcademicYear, { nullable: false })
  @JoinColumn({ name: 'academic_year_id' })
  academic_year: AcademicYear;

  @Column({ name: 'academic_year_id', type: 'int' })
  academic_year_id: number;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'datetime', nullable: true })
  deleted_at: Date | null;
}
