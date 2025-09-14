import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  /**
   * بررسی کاربر فعال و صحت رمز عبور
   */
  private async validateUser(username: string, password: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { username } });

    if (!user || !(user as any).isActive) {
      // کاربر یافت نشد یا غیرفعال است
      throw new UnauthorizedException('نام کاربری یا وضعیت کاربر نامعتبر است');
    }

    const ok = await bcrypt.compare(password, (user as any).passwordHash);
    if (!ok) {
      throw new UnauthorizedException('رمز عبور نادرست است');
    }

    return user;
    }

  /**
   * لاگین و تولید توکن JWT
   */
  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);

    // تشخیص نقش: اگر ستون/رابطه‌ای داری، اینجا بردار. در غیر این‌صورت پیش‌فرض Admin.
    const role =
      (user as any).role ??
      (user as any).role_name ??
      'Admin';

    const secret = process.env.JWT_SECRET || 'dev-secret';
    const payload = {
      sub: String((user as any).id),
      username: (user as any).username,
      role,
    };

    const access_token = jwt.sign(payload, secret, { expiresIn: '1d' });

    return {
      access_token,
      user: {
        id: String((user as any).id),
        username: (user as any).username,
        role,
      },
    };
  }
}
