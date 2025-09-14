import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AcademicYear } from './academic-year.entity';
import { toGregorian } from 'jalaali-js';

// ---------------- Helpers ----------------
function normalizeDigits(str: string) {
  if (!str) return '';
  return str
    .replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .trim();
}

function isGregorian(input?: string) {
  if (!input) return false;
  const s = normalizeDigits(input).replace(/[-.]/g, '/');
  return /^\d{4}\/\d{2}\/\d{2}$/.test(s);
}

function toGregorianISO(jalali: string) {
  const s = normalizeDigits(jalali).replace(/[-.]/g, '/'); // 1404/07/01
  const [jy, jm, jd] = s.split('/').map(n => parseInt(n, 10));
  if (!jy || !jm || !jd) throw new Error('bad jalali');
  const g = toGregorian(jy, jm, jd);
  return `${g.gy}-${String(g.gm).padStart(2, '0')}-${String(g.gd).padStart(2, '0')}`;
}

function prepareDate(input?: string | null, fieldName = 'date'): string | null {
  if (input == null) return null;
  const v = normalizeDigits(input);
  if (v === '') return null;

  // اگر جلالی وارد شد (یا دارای '/')
  if (v.includes('/')) {
    try {
      return toGregorianISO(v);
    } catch {
      throw new BadRequestException(`فرمت ${fieldName} نامعتبر است.`);
    }
  }

  // اگر میلادی وارد شد
  const iso = v.replace(/\./g, '-').replace(/\//g, '-');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    throw new BadRequestException(`فرمت ${fieldName} باید YYYY-MM-DD باشد.`);
  }
  return iso;
}

// --------------- Types -------------------
type CreateDto = {
  title: string;
  start_date?: string | null;
  end_date?: string | null;
  is_current?: boolean;
};
type UpdateDto = Partial<Pick<AcademicYear, 'title' | 'start_date' | 'end_date'>>;

// --------------- Service -----------------
@Injectable()
export class AcademicYearsService {
  constructor(
    @InjectRepository(AcademicYear) private readonly repo: Repository<AcademicYear>,
    private readonly ds: DataSource,
  ) {}

  findAll() {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  findCurrent() {
    return this.repo.findOne({ where: { is_current: 1 as any } });
  }

  async create(dto: CreateDto) {
    if (!dto.title?.trim()) throw new BadRequestException('عنوان سال الزامی است');

    const startISO = prepareDate(dto.start_date ?? null, 'تاریخ شروع');
    const endISO   = prepareDate(dto.end_date   ?? null, 'تاریخ پایان');

    const entity = this.repo.create({
      title: dto.title.trim(),
      start_date: startISO,
      end_date: endISO,
      is_current: dto.is_current ? 1 : 0,
    });

    if (dto.is_current) {
      return this.ds.transaction(async (manager) => {
        await manager.createQueryBuilder().update(AcademicYear).set({ is_current: 0 }).execute();
        const saved = await manager.save(entity);
        await manager.update(AcademicYear, saved.id, { is_current: 1 });
        return saved;
      });
    }
    return this.repo.save(entity);
  }

  async setCurrent(id: number) {
    const exists = await this.repo.findOne({ where: { id } });
    if (!exists) throw new NotFoundException('سال مورد نظر یافت نشد');

    await this.ds.transaction(async (manager) => {
      await manager.createQueryBuilder().update(AcademicYear).set({ is_current: 0 }).execute();
      await manager.update(AcademicYear, id, { is_current: 1 });
    });
    return this.repo.findOne({ where: { id } });
  }

  async update(id: number, dto: UpdateDto) {
    const exists = await this.repo.findOne({ where: { id } });
    if (!exists) throw new NotFoundException('سال مورد نظر یافت نشد');

    const patch: Partial<AcademicYear> = {};
    if (dto.title != null) patch.title = dto.title.trim();

    if ('start_date' in dto) patch.start_date = prepareDate(dto.start_date ?? null, 'تاریخ شروع');
    if ('end_date'   in dto) patch.end_date   = prepareDate(dto.end_date   ?? null, 'تاریخ پایان');

    await this.repo.update(id, patch);
    return this.repo.findOne({ where: { id } });
  }

  async remove(id: number) {
    const exists = await this.repo.findOne({ where: { id } });
    if (!exists) throw new NotFoundException('سال مورد نظر یافت نشد');
    if (exists.is_current) throw new BadRequestException('نمی‌توان سال تحصیلیِ جاری را حذف کرد.');
    await this.repo.delete(id);
    return { ok: true };
  }
}
