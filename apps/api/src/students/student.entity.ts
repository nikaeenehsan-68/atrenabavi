import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

export type GuardianType = 'father' | 'mother' | 'other';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  // دانش‌آموز
  @Column({ length: 100 })
  first_name: string;

  @Column({ length: 100 })
  last_name: string;

    @Column({ type: 'varchar', length: 10, nullable: true /* یا false اگر الزامیه */, unique: false })
  national_code: string | null;

  @Column({ length: 50, nullable: true })
  birth_certificate_no: string;                      // فقط string، nullable: true کافی است

  @Column({ length: 100, nullable: true })
  birth_certificate_place: string;

  @Column({ length: 100, nullable: true })
  birth_certificate_id: string;

  @Column({ type: 'date', nullable: true })
  birth_date: Date;                                  // فقط Date

  @Column({ length: 100, nullable: true })
  birth_place: string;

  @Column({ length: 255, nullable: true })
  photo: string;

  // پدر
  @Column({ length: 100 })
  father_name: string;

  @Column({ length: 10 })
  father_national_code: string;

  @Column({ type: 'date', nullable: true })
  father_birth_date: Date;

  @Column({ length: 15, nullable: true })
  father_mobile: string;

  @Column({ length: 100, nullable: true })
  father_birth_certificate_place: string;

  @Column({ length: 100, nullable: true })
  father_education: string;

  @Column({ length: 100, nullable: true })
  father_job: string;

  // مادر
  @Column({ length: 100 })
  mother_first_name: string;

  @Column({ length: 100 })
  mother_last_name: string;

  @Column({ length: 10 })
  mother_national_code: string;

  @Column({ type: 'date', nullable: true })
  mother_birth_date: Date;

  @Column({ length: 15, nullable: true })
  mother_mobile: string;

  @Column({ length: 100, nullable: true })
  mother_education: string;

  @Column({ length: 100, nullable: true })
  mother_job: string;

  // سرپرست/آدرس/وضعیت
  @Column({ type: 'enum', enum: ['father', 'mother', 'other'], default: 'father' })
  guardian: GuardianType;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 20, nullable: true })
  home_phone: string;

  @Column({ length: 50, nullable: true })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
