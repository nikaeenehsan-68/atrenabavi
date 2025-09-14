// apps/web/src/lib/date.ts
import { toGregorian, toJalaali } from 'jalaali-js';

/** تبدیل ارقام فارسی/عربی به لاتین */
export function normalizeDigits(s?: string | null) {
  if (!s) return '';
  const mapFa = '۰۱۲۳۴۵۶۷۸۹';
  const mapAr = '٠١٢٣٤٥٦٧٨٩';
  return String(s)
    .replace(/[۰-۹]/g, d => String(mapFa.indexOf(d)))
    .replace(/[٠-٩]/g, d => String(mapAr.indexOf(d)))
    .trim();
}

/** فقط اگر سال > 1700 باشد میلادی حساب کن (الگوی YYYY-MM-DD) */
export function isGregorian(s?: string | null) {
  if (!s) return false;
  const t = normalizeDigits(s).replace(/[./]/g, '-');
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if (!m) return false;
  const year = parseInt(m[1], 10);
  return year >= 1700; // جلوی اشتباه گرفتن 1404-.. را می‌گیرد
}

/** نمایش شمسی از تاریخ میلادی DB (YYYY-MM-DD) */
export function toJalali(gDate?: string | null) {
  if (!gDate) return '—';
  const [y, m, d] = normalizeDigits(gDate).split('-').map(Number);
  const j = toJalaali(y, m, d);
  return `${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`;
}

/** تبدیل ورودی شمسی کاربر به میلادی استاندارد برای API/DB */
export function fromJalali(jStr: string) {
  const norm = normalizeDigits(jStr).replace(/[-.]/g, '/'); // 1404/06/01
  const [jy, jm, jd] = norm.split('/').map(n => parseInt(n, 10));
  const g = toGregorian(jy, jm, jd);
  return `${g.gy}-${String(g.gm).padStart(2, '0')}-${String(g.gd).padStart(2, '0')}`;
}
