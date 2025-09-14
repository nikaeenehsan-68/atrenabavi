// apps/api/src/student-enrollments/student-enrollment.entity.ts
import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'student_enrollments' })
@Index(['academic_year_id', 'class_id'])
@Index(['student_id', 'academic_year_id'])
export class StudentEnrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  student_id: number;

  @Column({ type: 'int' })
  academic_year_id: number;

  @Column({ type: 'int', nullable: true })
  class_id: number | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  status: string | null; // مثلا: active, transferred, suspended

  @Column({ type: 'datetime', nullable: true })
  created_at: string | null;

  @Column({ type: 'datetime', nullable: true })
  updated_at: string | null;

  @Column({ type: 'datetime', nullable: true })
  deleted_at: string | null;
}
