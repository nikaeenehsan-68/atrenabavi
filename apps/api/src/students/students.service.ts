// apps/api/src/students/students.service.ts
import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(@InjectRepository(Student) private readonly repo: Repository<Student>) {}

  /** حذف مقادیر خالی، trim رشته‌ها، و تبدیل تاریخ‌های ISO به Date */
  private normalize<T extends Record<string, any>>(dto: T): Partial<Student> {
    const cleaned: any = {};

    for (const [k, v] of Object.entries(dto)) {
      if (v === '' || v === null || v === undefined) continue; // drop empties
      cleaned[k] = typeof v === 'string' ? v.trim() : v;
    }

    // convert ISO date string -> Date
    const dateKeys = ['birth_date', 'father_birth_date', 'mother_birth_date'] as const;
    for (const key of dateKeys) {
      if (typeof cleaned[key] === 'string') {
        const d = new Date(cleaned[key] as string);
        if (!isNaN(d.getTime())) cleaned[key] = d;
        else delete cleaned[key]; // invalid → drop (validator از قبل مراقبت می‌کند)
      }
    }

    return cleaned;
  }

  async create(dto: CreateStudentDto) {
    try {
      const entity = this.repo.create(this.normalize(dto));
      const saved = await this.repo.save(entity);
      return { id: saved.id };
    } catch (e: any) {
      // لاگ کامل‌تر از خطای DB
      const msg =
        e?.detail || e?.sqlMessage || e?.message || 'Unknown DB error';
      this.logger.error(`Create student failed: ${msg}`, e?.stack || '');
      throw new InternalServerErrorException('DB error', { cause: e });
    }
  }

  findAll() {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number) {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Student not found');
    return s;
  }

  async update(id: number, dto: UpdateStudentDto) {
    await this.findOne(id); // ensure exists
    try {
      const partial = this.normalize(dto);
      await this.repo.update(id, partial);
      return this.findOne(id);
    } catch (e: any) {
      const msg =
        e?.detail || e?.sqlMessage || e?.message || 'Unknown DB error';
      this.logger.error(`Update student ${id} failed: ${msg}`, e?.stack || '');
      throw new InternalServerErrorException('DB error', { cause: e });
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.softDelete(id);
    return { success: true };
  }
}
