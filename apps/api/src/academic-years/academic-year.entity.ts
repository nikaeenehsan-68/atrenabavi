import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'academic_years' })
export class AcademicYear {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'date', nullable: true })
  start_date: string | null;

  @Column({ type: 'date', nullable: true })
  end_date: string | null;

  @Column({ type: 'tinyint', width: 1, default: 0 })
  is_current: number;

  // current_flag ستون تولیدی DB است؛ در Entity نمی‌آوریم.
}
