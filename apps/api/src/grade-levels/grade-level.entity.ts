import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { AcademicTerm } from '../academic-terms/academic-term.entity';

@Entity({ name: 'grade_levels' })
export class GradeLevel {
  @PrimaryGeneratedColumn()
  id: number;

  // FK به دوره تحصیلی
  @ManyToOne(() => AcademicTerm, { nullable: false })
  @JoinColumn({ name: 'academic_term_id' })
  academic_term: AcademicTerm;

  @Column({ name: 'academic_term_id' })
  academic_term_id: number;

  @Column({ type: 'varchar', length: 20, nullable: false })
  grade_code: string;

  @Column({ type: 'varchar', length: 120, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 20, nullable: false, default: 'فعال' })
  status: string;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'datetime', nullable: true })
  deleted_at: Date | null;
}
