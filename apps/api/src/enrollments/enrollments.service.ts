import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './enrollment.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { AcademicYear } from '../academic-years/academic-year.entity';
import { Student } from '../students/student.entity';
import { ClassEntity } from '../classes/class.entity';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment) private readonly repo: Repository<Enrollment>,
    @InjectRepository(AcademicYear)
    private readonly yearRepo: Repository<AcademicYear>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(ClassEntity)
    private readonly classRepo: Repository<ClassEntity>,
  ) {}

  private async getCurrentYearOrThrow() {
    const year = await this.yearRepo.findOne({
      where: { is_current: 1 as any } as any,
    });
    if (!year) throw new BadRequestException('سال تحصیلی جاری تنظیم نشده است');
    return year;
  }

  async findAllForCurrentYear() {
    const year = await this.getCurrentYearOrThrow();
    const rows = await this.repo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.student', 's')
      .leftJoinAndSelect('e.klass', 'c')
      .where('e.academic_year_id = :y', { y: year.id })
      .orderBy('e.id', 'DESC')
      .getMany();
    return { year, rows };
  }

  // apps/api/src/enrollments/enrollments.service.ts
  async listUnenrolledStudentsForCurrentYear() {
    const year = await this.getCurrentYearOrThrow();

    const students = await this.studentRepo.createQueryBuilder('s')
  .leftJoin('student_enrollments', 'e', 'e.student_id = s.id AND e.academic_year_id = :y', { y: year.id })
  .where('e.id IS NULL')
  .orderBy('s.id', 'DESC')
  .getMany();

    return { year, students };
  }

  async metaForCurrentYear() {
    const year = await this.getCurrentYearOrThrow();
    const classes = await this.classRepo.find({
      where: { academic_year_id: year.id } as any,
      order: { id: 'DESC' as any },
    });
    const statuses = [
      { value: 'active', label: 'فعال' },
      { value: 'deferred', label: 'معوق' },
      { value: 'expelled', label: 'اخراج' },
      { value: 'graduated', label: 'فارغ‌التحصیل' },
    ];
    return { year, classes, statuses };
  }

  async create(dto: CreateEnrollmentDto) {
    const year = await this.getCurrentYearOrThrow();
    const student = await this.studentRepo.findOne({
      where: { id: dto.student_id },
    });
    if (!student) throw new NotFoundException('دانش‌آموز یافت نشد');

    const klass = await this.classRepo.findOne({ where: { id: dto.class_id } });
    if (!klass) throw new NotFoundException('کلاس یافت نشد');
    if ((klass as any).academic_year_id !== year.id)
      throw new BadRequestException('کلاس انتخابی مربوط به سال جاری نیست');

    const exists = await this.repo.findOne({
      where: { student_id: dto.student_id, academic_year_id: year.id } as any,
    });
    if (exists)
      throw new BadRequestException(
        'برای این دانش‌آموز در این سال قبلاً ثبت‌نام شده است',
      );

    try {
      const entity = this.repo.create({
        student_id: dto.student_id,
        class_id: dto.class_id,
        status: (dto.status as any) || 'active',
        academic_year_id: year.id,
      });
      return await this.repo.save(entity);
    } catch (e: any) {
      throw new InternalServerErrorException('DB error', { cause: e });
    }
  }

  async update(id: number, dto: UpdateEnrollmentDto) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('ثبت‌نام یافت نشد');
    await this.repo.update(id, { ...dto } as any);
    return this.repo.findOne({ where: { id } });
  }

  async remove(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('ثبت‌نام یافت نشد');
    await this.repo.delete(id);
    return { success: true };
  }
}
