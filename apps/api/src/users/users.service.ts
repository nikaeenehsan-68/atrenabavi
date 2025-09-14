import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  async create(dto: CreateUserDto) {
    try {
      const exists = await this.repo.findOne({ where: { username: dto.username } });
      if (exists) throw new BadRequestException('نام کاربری تکراری است');

      const password_hash = await bcrypt.hash(dto.password, 10);

      const entity = this.repo.create({
        ...dto,
        password_hash,
      } as any);
      delete (entity as any).password;

      return await this.repo.save(entity);
    } catch (e: any) {
      this.logger.error('Create user failed', e?.stack || e?.message);
      if (e?.code === 'ER_DUP_ENTRY') throw new BadRequestException('اطلاعات تکراری (username/national_id)');
      if (e?.name === 'BadRequestException') throw e;
      throw new InternalServerErrorException('DB error', { cause: e });
    }
  }

  async findAll() {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('کاربر یافت نشد');
    return row;
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id);
    const patch: any = { ...dto };

    if (dto.password) {
      patch.password_hash = await bcrypt.hash(dto.password, 10);
      delete patch.password;
    }

    try {
      await this.repo.update(id, patch);
      return this.findOne(id);
    } catch (e: any) {
      this.logger.error(`Update user ${id} failed`, e?.stack || e?.message);
      if (e?.code === 'ER_DUP_ENTRY') throw new BadRequestException('اطلاعات تکراری (username/national_id)');
      throw new InternalServerErrorException('DB error', { cause: e });
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.delete(id);
    return { success: true };
  }
}
