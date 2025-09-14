import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamTitle } from './exam-title.entity';
import { CreateExamTitleDto } from './dto/create-exam-title.dto';
import { UpdateExamTitleDto } from './dto/update-exam-title.dto';
import { AcademicYear } from '../academic-years/academic-year.entity';

@Injectable()
export class ExamsService {
  constructor(
    @InjectRepository(ExamTitle) private readonly repo: Repository<ExamTitle>,
    @InjectRepository(AcademicYear) private readonly yearRepo: Repository<AcademicYear>,
  ) {}

  private async getCurrentYearOrThrow() {
    const year = await this.yearRepo.findOne({ where: { is_current: 1 as any } as any });
    if (!year) throw new BadRequestException('سال تحصیلی جاری تنظیم نشده است');
    return year;
    }

  async findAllForCurrentYear() {
    const year = await this.getCurrentYearOrThrow();
    const rows = await this.repo.find({
      where: { academic_year_id: year.id } as any,
      order: { id: 'DESC' as any },
    });
    return { year, rows };
  }

  async create(dto: CreateExamTitleDto) {
    const year = await this.getCurrentYearOrThrow();
    try {
      const entity = this.repo.create({
        name: dto.name,
        status: (dto.status as any) || 'active',
        academic_year_id: year.id,
      });
      return await this.repo.save(entity);
    } catch (e: any) {
      throw new InternalServerErrorException('DB error', { cause: e });
    }
  }

  async update(id: number, dto: UpdateExamTitleDto) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('عنوان امتحان یافت نشد');
    try {
      await this.repo.update(id, dto as any);
      return this.repo.findOne({ where: { id } });
    } catch (e: any) {
      throw new InternalServerErrorException('DB error', { cause: e });
    }
  }

  async remove(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('عنوان امتحان یافت نشد');
    // در صورت داشتن ستون deleted_at، حذف نرم انجام بدهیم:
    try {
      await this.repo.softDelete(id);
      return { success: true };
    } catch (e: any) {
      // اگر موتور DB حذف نرم را پشتیبانی نکرد، حذف سخت:
      await this.repo.delete(id);
      return { success: true };
    }
  }
}