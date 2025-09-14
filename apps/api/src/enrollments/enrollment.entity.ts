import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from '../students/student.entity';
import { AcademicYear } from '../academic-years/academic-year.entity';
import { ClassEntity } from '../classes/class.entity';

// ✅ به‌جای type از enum استفاده کن (runtime value دارد)
export enum EnrollmentStatus {
  ACTIVE = 'active',
  DEFERRED = 'deferred',
  EXPELLED = 'expelled',
  GRADUATED = 'graduated',
}

@Entity({ name: 'student_enrollments' })
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  student_id: number;

  @Column({ type: 'int' })
  academic_year_id: number;

  @Column({ type: 'int' })
  class_id: number;

  // ✅ enum واقعی را به TypeORM بده
  @Column({ type: 'enum', enum: EnrollmentStatus, default: EnrollmentStatus.ACTIVE })
  status: EnrollmentStatus;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;

  @ManyToOne(() => Student, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => AcademicYear, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'academic_year_id' })
  academic_year: AcademicYear;

  @ManyToOne(() => ClassEntity, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  klass: ClassEntity;
}
