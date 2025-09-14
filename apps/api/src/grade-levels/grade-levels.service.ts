import { Injectable, NotFoundException, InternalServerErrorException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GradeLevel } from './grade-level.entity';
import { CreateGradeLevelDto } from './dto/create-grade-level.dto';
import { UpdateGradeLevelDto } from './dto/update-grade-level.dto';
import { AcademicTerm } from '../academic-terms/academic-term.entity';

@Injectable()
export class GradeLevelsService {
  private readonly logger = new Logger(GradeLevelsService.name);

  constructor(
    @InjectRepository(GradeLevel) private readonly repo: Repository<GradeLevel>,
    @InjectRepository(AcademicTerm) private readonly termRepo: Repository<AcademicTerm>,
  ) {}

  async create(dto: CreateGradeLevelDto) {
    const term = await this.termRepo.findOne({ where: { id: dto.academic_term_id } });
    if (!term) throw new BadRequestException('دوره تحصیلی یافت نشد');

    try {
      const entity = this.repo.create({
        academic_term_id: dto.academic_term_id,
        grade_code: dto.grade_code.trim(),
        name: dto.name.trim(),
        status: dto.status || 'فعال',
      });
      return await this.repo.save(entity);
    } catch (e: any) {
      this.logger.error(`Create grade-level failed: ${e?.message}`, e?.stack || '');
      throw new InternalServerErrorException('DB error', { cause: e });
    }
  }

  findAll() {
    return this.repo.find({
      relations: ['academic_term'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id }, relations: ['academic_term'] });
    if (!row) throw new NotFoundException('Grade level not found');
    return row;
  }

  async update(id: number, dto: UpdateGradeLevelDto) {
    await this.findOne(id);
    if (dto.academic_term_id) {
      const term = await this.termRepo.findOne({ where: { id: dto.academic_term_id } });
      if (!term) throw new BadRequestException('دوره تحصیلی یافت نشد');
    }
    try {
      const patch: Partial<GradeLevel> = {};
      if (dto.academic_term_id !== undefined) patch.academic_term_id = dto.academic_term_id;
      if (dto.grade_code !== undefined) patch.grade_code = dto.grade_code.trim();
      if (dto.name !== undefined) patch.name = dto.name.trim();
      if (dto.status !== undefined) patch.status = dto.status;
      await this.repo.update(id, patch);
      return this.findOne(id);
    } catch (e: any) {
      this.logger.error(`Update grade-level ${id} failed: ${e?.message}`, e?.stack || '');
      throw new InternalServerErrorException('DB error', { cause: e });
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.softDelete(id);
    return { success: true };
  }
}
