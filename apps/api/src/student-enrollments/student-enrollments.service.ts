// apps/api/src/student-enrollments/student-enrollments.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { StudentEnrollment } from './student-enrollment.entity';
import { FindEnrollmentsDto } from './dto/find-enrollments.dto';
import { UpsertEnrollmentDto } from './dto/upsert-enrollment.dto';

@Injectable()
export class StudentEnrollmentsService {
  constructor(
    @InjectRepository(StudentEnrollment)
    private repo: Repository<StudentEnrollment>,
  ) {}

  async findAll(q: FindEnrollmentsDto): Promise<StudentEnrollment[]> {
    const qb = this.repo.createQueryBuilder('e');
    if (q.academic_year_id) qb.andWhere('e.academic_year_id = :y', { y: q.academic_year_id });
    if (q.class_id)         qb.andWhere('e.class_id = :c', { c: q.class_id });
    if (q.student_id)       qb.andWhere('e.student_id = :s', { s: q.student_id });
    if (q.status)           qb.andWhere('e.status = :st', { st: q.status });
    qb.andWhere('e.deleted_at IS NULL');
    qb.orderBy('e.created_at', 'DESC');
    return qb.getMany();
  }

  async upsert(dto: UpsertEnrollmentDto) {
    // روش 1: QueryBuilder (ایمن، ساده)
    const existing = await this.repo.createQueryBuilder('e')
      .where('e.student_id = :s', { s: dto.student_id })
      .andWhere('e.academic_year_id = :y', { y: dto.academic_year_id })
      .andWhere('e.deleted_at IS NULL')
      .orderBy('e.id', 'DESC')
      .getOne();

    // روش 2 (جایگزین): اگر QueryBuilder نمی‌خواهی، از find+take استفاده کن:
    // const existing = (await this.repo.find({
    //   where: { student_id: dto.student_id, academic_year_id: dto.academic_year_id, deleted_at: IsNull() },
    //   order: { id: 'DESC' },
    //   take: 1,
    // }))[0];

    if (existing) {
      existing.class_id = dto.class_id ?? null;
      existing.updated_at = new Date().toISOString();
      return this.repo.save(existing);
    }

    const row = this.repo.create({
      student_id: dto.student_id,
      academic_year_id: dto.academic_year_id,
      class_id: dto.class_id ?? null,
      status: 'active',
      created_at: new Date().toISOString(),
    });
    return this.repo.save(row);
  }

  async update(id: number, patch: Partial<StudentEnrollment>) {
    await this.repo.update(id, { ...patch, updated_at: new Date().toISOString() });
    return this.repo.findOne({ where: { id } });
  }

  async softDelete(id: number) {
    await this.repo.update(id, { deleted_at: new Date().toISOString() });
    return { ok: true };
  }
}
