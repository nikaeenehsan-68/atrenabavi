import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 80 })
  first_name: string;

  @Column({ type: 'varchar', length: 80 })
  last_name: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  national_id: string | null;

  @Column({ type: 'varchar', length: 64, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'date', nullable: true })
  birth_date: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  birth_certificate_identifier: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  birth_certificate_issue_place: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  birth_place: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  father_name: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  mother_first_name: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  mother_last_name: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  spouse_first_name: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  spouse_last_name: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  spouse_mobile: string | null;

  @Column({ type: 'text', nullable: true })
  home_address: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  home_phone: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  marital_status: string | null;

  @Column({ type: 'int', default: 0 })
  children_count: number;

  @Column({ type: 'varchar', length: 16, nullable: true })
  bank_card_number: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  bank_account_number: string | null;

  @Column({ type: 'varchar', length: 26, nullable: true })
  bank_sheba_number: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bank_name: string | null;

  @Column({ type: 'tinyint', width: 1, default: 1 })
  is_active: boolean;

  @Column({ type: 'datetime', nullable: true })
  last_login_at: Date | null;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;
}
