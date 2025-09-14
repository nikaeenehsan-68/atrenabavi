import { Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicTerm } from './academic-term.entity';
import { CreateAcademicTermDto } from './dto/create-academic-term.dto';
import { UpdateAcademicTermDto } from './dto/update-academic-term.dto';

@Injectable()
export class AcademicTermsService {
  private readonly logger = new Logger(AcademicTermsService.name);

  constructor(
    @InjectRepository(AcademicTerm)
    private readonly repo: Repository<AcademicTerm>,
  ) {}

  async create(dto: CreateAcademicTermDto) {
    try {
      const entity = this.repo.create({
        name: dto.name.trim(),
        status: dto.status || 'فعال',
      });
      const saved = await this.repo.save(entity);
      return saved; // یا return { id: saved.id };
    } catch (e: any) {
      this.logger.error(`Create term failed: ${e?.message}`, e?.stack || '');
      throw new InternalServerErrorException('DB error', { cause: e });
    }
  }

  findAll() {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number) {
    const term = await this.repo.findOne({ where: { id } });
    if (!term) throw new NotFoundException('Term not found');
    return term;
  }

  async update(id: number, dto: UpdateAcademicTermDto) {
    await this.findOne(id);
    try {
      const patch: Partial<AcademicTerm> = {};
      if (dto.name !== undefined) patch.name = dto.name.trim();
      if (dto.status !== undefined) patch.status = dto.status;
      await this.repo.update(id, patch);
      return this.findOne(id);
    } catch (e: any) {
      this.logger.error(`Update term ${id} failed: ${e?.message}`, e?.stack || '');
      throw new InternalServerErrorException('DB error', { cause: e });
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.softDelete(id);
    return { success: true };
  }
}
