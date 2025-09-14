// apps/api/src/staff-roles/staff-roles.service.ts
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffRole } from './staff-role.entity';
import { CreateStaffRoleDto } from './dto/create-staff-role.dto';
import { UpdateStaffRoleDto } from './dto/update-staff-role.dto';
import { AcademicYear } from '../academic-years/academic-year.entity';
import { AcademicTerm } from '../academic-terms/academic-term.entity';
import { ClassEntity } from '../classes/class.entity';
import { User } from '../users/user.entity';

// --- پیکربندی نقش‌ها: فقط اینجا تغییر بده/اضافه کن ---
type RoleDef = {
  id: number;
  key: string;
  name: string;
  needs_class?: boolean;
  needs_term?: boolean;
};
const ROLES_DEF: RoleDef[] = [
  { id: 1, key: 'teacher', name: 'معلم', needs_class: true }, // فقط معلم نیاز به کلاس دارد
  { id: 2, key: 'assistant', name: 'معاون', needs_term: true }, // فقط معاون نیاز به دوره دارد
  // بقیه نقش‌ها فقط خود نقش ثبت می‌شود:
  { id: 3, key: 'principal', name: 'مدیر' },
  { id: 4, key: 'staff', name: 'کارمند' },
  { id: 5, key: 'counselor', name: 'مشاور' },
  // ... در صورت نیاز اضافه کن
];

function needsClass(role_id: number) {
  return !!ROLES_DEF.find((r) => r.id === role_id)?.needs_class;
}
function needsTerm(role_id: number) {
  return !!ROLES_DEF.find((r) => r.id === role_id)?.needs_term;
}

@Injectable()
export class StaffRolesService {
  constructor(
    @InjectRepository(StaffRole) private readonly repo: Repository<StaffRole>,
    @InjectRepository(AcademicYear)
    private readonly yearRepo: Repository<AcademicYear>,
    @InjectRepository(AcademicTerm)
    private readonly termRepo: Repository<AcademicTerm>,
    @InjectRepository(ClassEntity)
    private readonly classRepo: Repository<ClassEntity>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  private async getCurrentYearOrThrow() {
    const year = await this.yearRepo.findOne({
      where: { is_current: 1 as any } as any,
    });
    if (!year) throw new BadRequestException('سال تحصیلی جاری تنظیم نشده است');
    return year;
  }

  // ✅ فقط برای نقش‌هایی که فلگ دارند، زیرگزینه را چک می‌کنیم
  private async validateConstraints(input: {
    role_id: number;
    class_id?: number;
    academic_term_id?: number;
    yearId: number;
  }) {
    const { role_id, class_id, academic_term_id, yearId } = input;

    if (needsClass(role_id)) {
      if (!class_id)
        throw new BadRequestException('برای این نقش، انتخاب کلاس الزامی است');
      const klass = await this.classRepo
        .createQueryBuilder('c')
        .where('c.id = :cid AND c.academic_year_id = :y', {
          cid: class_id,
          y: yearId,
        })
        .getOne();
      if (!klass) {
        const exists = await this.classRepo.findOne({
          where: { id: class_id } as any,
        });
        if (!exists) throw new NotFoundException('کلاس یافت نشد');
        throw new BadRequestException('کلاس انتخابی مربوط به سال جاری نیست');
      }
    }

    if (needsTerm(role_id)) {
      if (!academic_term_id)
        throw new BadRequestException('برای این نقش، انتخاب دوره الزامی است');
      const term = await this.termRepo.findOne({
        where: { id: academic_term_id } as any,
      });
      if (!term) throw new NotFoundException('دوره تحصیلی یافت نشد');
    }
  }

  // برای UI
  rolesList(): RoleDef[] {
    return ROLES_DEF;
  }

  // apps/api/src/staff-roles/staff-roles.service.ts

  async findAllForCurrentYear() {
    const year = await this.getCurrentYearOrThrow();

    const rows = await this.repo
      .createQueryBuilder('ur')
      .leftJoinAndSelect('ur.user', 'u')
      .leftJoinAndSelect('ur.klass', 'c')
      .leftJoinAndSelect('ur.academic_term', 't')
      .where('ur.academic_year_id = :y', { y: year.id })
      .orderBy('ur.id', 'DESC')
      .getMany();

    // 👇 نقش‌ها را روی آیدی مپ می‌کنیم تا برچسب آماده برگردانیم
    const nameById: Record<number, string> = {};
    for (const r of ROLES_DEF) nameById[r.id] = r.name;

    const rowsWithLabel = rows.map((r: any) => ({
      ...r,
      role_label: nameById[r.role_id] ?? String(r.role_id),
    }));

    return { year, rows: rowsWithLabel, roles: this.rolesList() };
  }

  async metaForCurrentYear() {
    const year = await this.getCurrentYearOrThrow();

    const users = await this.userRepo.find({ order: { id: 'DESC' as any } });
    const classes = await this.classRepo
      .createQueryBuilder('c')
      .where('c.academic_year_id = :y', { y: year.id })
      .orderBy('c.id', 'DESC')
      .getMany();

    // دوره‌ها: بدون فیلتر سال
    const terms = await this.termRepo.find({ order: { id: 'DESC' as any } });

    return { year, users, classes, terms, roles: this.rolesList() };
  }

  async create(dto: CreateStaffRoleDto) {
    const year = await this.getCurrentYearOrThrow();

    const user = await this.userRepo.findOne({
      where: { id: dto.user_id } as any,
    });
    if (!user) throw new NotFoundException('همکار یافت نشد');

    await this.validateConstraints({
      role_id: dto.role_id,
      class_id: dto.class_id,
      academic_term_id: dto.academic_term_id,
      yearId: year.id,
    });

    // جلوگیری از رکورد کاملاً تکراری در همان سال
    const dup = await this.repo.findOne({
      where: {
        user_id: dto.user_id,
        role_id: dto.role_id,
        academic_year_id: year.id,
        class_id: needsClass(dto.role_id) ? (dto.class_id ?? null) : null,
        academic_term_id: needsTerm(dto.role_id)
          ? (dto.academic_term_id ?? null)
          : null,
      } as any,
    });
    if (dup)
      throw new BadRequestException('این نقش قبلاً برای این همکار ثبت شده است');

    try {
      const entity = this.repo.create({
        user_id: dto.user_id,
        role_id: dto.role_id,
        academic_year_id: year.id,
        class_id: needsClass(dto.role_id) ? (dto.class_id ?? null) : null,
        academic_term_id: needsTerm(dto.role_id)
          ? (dto.academic_term_id ?? null)
          : null,
      });
      return await this.repo.save(entity);
    } catch (e: any) {
      throw new InternalServerErrorException('DB error', { cause: e });
    }
  }

  async update(id: number, dto: UpdateStaffRoleDto) {
    const row = await this.repo.findOne({ where: { id } as any });
    if (!row) throw new NotFoundException('نقش یافت نشد');

    const role_id = dto.role_id ?? row.role_id;
    const class_id = needsClass(role_id)
      ? typeof dto.class_id !== 'undefined'
        ? dto.class_id
        : row.class_id
      : null;
    const academic_term_id = needsTerm(role_id)
      ? typeof dto.academic_term_id !== 'undefined'
        ? dto.academic_term_id
        : row.academic_term_id
      : null;

    await this.validateConstraints({
      role_id,
      class_id: class_id ?? undefined,
      academic_term_id: academic_term_id ?? undefined,
      yearId: row.academic_year_id,
    });

    try {
      await this.repo.update(id, {
        role_id,
        class_id,
        academic_term_id,
      } as any);
      return this.repo.findOne({ where: { id } as any });
    } catch (e: any) {
      throw new InternalServerErrorException('DB error', { cause: e });
    }
  }

  async remove(id: number) {
    const row = await this.repo.findOne({ where: { id } as any });
    if (!row) throw new NotFoundException('نقش یافت نشد');

    await this.repo.delete(id);
    return { success: true };
  }
}
