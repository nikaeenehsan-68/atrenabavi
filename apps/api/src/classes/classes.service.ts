import {
  Injectable, NotFoundException, InternalServerErrorException, BadRequestException, Logger,
} from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassEntity } from './class.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { GradeLevel } from '../grade-levels/grade-level.entity';
import { AcademicYear } from '../academic-years/academic-year.entity';

@Injectable()
export class ClassesService {
  private readonly logger = new Logger(ClassesService.name);

  constructor(
    @InjectRepository(ClassEntity) private readonly repo: Repository<ClassEntity>,
    @InjectRepository(GradeLevel) private readonly gradeRepo: Repository<GradeLevel>,
    @InjectRepository(AcademicYear) private readonly yearRepo: Repository<AcademicYear>,
  ) {}

  private async getCurrentYear(): Promise<AcademicYear> {
    const year = await this.yearRepo.findOne({ where: { is_current: 1 as any } });
    if (!year) throw new BadRequestException('سال تحصیلی جاری تنظیم نشده است');
    return year;
  }

  async create(dto: CreateClassDto) {
    const grade = await this.gradeRepo.findOne({ where: { id: dto.grade_level_id } });
    if (!grade) throw new BadRequestException('پایه تحصیلی یافت نشد');

    let yearId = dto.academic_year_id;
    if (!yearId) {
      const current = await this.getCurrentYear();
      yearId = current.id;
    } else {
      const y = await this.yearRepo.findOne({ where: { id: yearId } });
      if (!y) throw new BadRequestException('سال تحصیلی معتبر نیست');
    }

    try {
      const entity = this.repo.create({
        code: dto.code.trim(),
        name: dto.name.trim(),
        grade_level_id: dto.grade_level_id,
        academic_year_id: yearId,
      });
      return await this.repo.save(entity);
    } catch (e: any) {
      this.logger.error(`Create class failed: ${e?.message}`, e?.stack || '');
      throw new InternalServerErrorException('DB error', { cause: e });
    }
  }

  async findAll(academic_year_id?: number, onlyCurrent?: boolean) {
    let yearId = academic_year_id;
    if (onlyCurrent) {
      const current = await this.getCurrentYear();
      yearId = current.id;
    }
    const where = yearId ? { academic_year_id: yearId } : {};
    return this.repo.find({
      where,
      relations: ['grade_level', 'academic_year'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id }, relations: ['grade_level', 'academic_year'] });
    if (!row) throw new NotFoundException('کلاس یافت نشد');
    return row;
  }

  async update(id: number, dto: UpdateClassDto) {
    await this.findOne(id);

    if (dto.grade_level_id) {
      const grade = await this.gradeRepo.findOne({ where: { id: dto.grade_level_id } });
      if (!grade) throw new BadRequestException('پایه تحصیلی یافت نشد');
    }
    if (dto.academic_year_id) {
      const y = await this.yearRepo.findOne({ where: { id: dto.academic_year_id } });
      if (!y) throw new BadRequestException('سال تحصیلی معتبر نیست');
    }

    try {
      const patch: Partial<ClassEntity> = {};
      if (dto.code !== undefined) patch.code = dto.code.trim();
      if (dto.name !== undefined) patch.name = dto.name.trim();
      if (dto.grade_level_id !== undefined) patch.grade_level_id = dto.grade_level_id;
      if (dto.academic_year_id !== undefined) patch.academic_year_id = dto.academic_year_id;
      await this.repo.update(id, patch);
      return this.findOne(id);
    } catch (e: any) {
      this.logger.error(`Update class ${id} failed: ${e?.message}`, e?.stack || '');
      throw new InternalServerErrorException('DB error', { cause: e });
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.softDelete(id);
    return { success: true };
  }
}
