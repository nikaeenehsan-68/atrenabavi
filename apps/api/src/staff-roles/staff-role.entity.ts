// apps/api/src/staff-roles/staff-role.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { AcademicYear } from '../academic-years/academic-year.entity';
import { AcademicTerm } from '../academic-terms/academic-term.entity';
import { ClassEntity } from '../classes/class.entity';

@Entity({ name: 'user_roles' })
export class StaffRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'int' })
  role_id: number; // 1=teacher, 2=assistant

  @Column({ type: 'int', nullable: true })
  class_id: number | null;

  @Column({ type: 'int' })
  academic_year_id: number;

  @Column({ type: 'int', nullable: true })
  academic_term_id: number | null;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;

  @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => AcademicYear, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'academic_year_id' })
  academic_year: AcademicYear;

  @ManyToOne(() => AcademicTerm, { eager: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'academic_term_id' })
  academic_term: AcademicTerm;

  @ManyToOne(() => ClassEntity, { eager: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'class_id' })
  klass: ClassEntity;
}
