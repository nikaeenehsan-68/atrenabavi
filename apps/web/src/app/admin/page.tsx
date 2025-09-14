import Link from "next/link";
import { Calendar, Settings, UserPlus, FileText, TrendingUp } from "lucide-react";
import { headers } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";
import { toJalali } from "@/lib/date";

export const dynamic = "force-dynamic";
export const revalidate = 0;



type Year = {
  id: number | string;
  title: string;
  start_date?: string | null;
  end_date?: string | null;
  is_current: 0 | 1;
};

async function getCurrentYear(): Promise<Year | null> {
  noStore(); // مطمئن: کش نشه
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "http";
    const base = `${proto}://${host}`;

    const r = await fetch(`${base}/api/academic-years/current`, {
      cache: "no-store",
      next: { revalidate: 0 },
    });
    if (!r.ok) return null;
    const data = await r.json();
    return data && (data as any).id ? (data as Year) : null;
  } catch {
    return null;
  }
}

export default async function AdminHome() {
  const currentYear = await getCurrentYear();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-sm text-gray-500">خوش آمدید 👋</div>
            <h1 className="text-2xl font-bold mt-1">داشبورد مدیریت</h1>
           <p className="text-gray-600 mt-2">
  {currentYear
    ? <>سال تحصیلی فعال: <b>{currentYear.title}</b> 
        (از {toJalali(currentYear.start_date)} تا {toJalali(currentYear.end_date)})
      </>
    : <>هنوز سال تحصیلی فعالی تنظیم نشده—از <a href="/admin/settings" className="text-teal-700 underline">تنظیمات سال تحصیلی</a> شروع کنید.</>
  }
</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/settings" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700">
              <Settings className="w-4 h-4" />
              تنظیمات سال تحصیلی
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="دانش‌آموزان" value="۰" hint="فعال / کل" />
        <StatCard title="همکاران" value="۰" hint="مربی / کارمند" />
        <StatCard title="شهریه وصول‌شده" value="۰ تومان" hint="ماه جاری" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <div className="flex items-center justify-between">
          <div className="font-semibold">میان‌برهای سریع</div>
          <Link href="/admin/settings" className="text-sm text-teal-700 hover:underline">نمایش همه</Link>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <QuickLink href="/admin/students/new" icon={<UserPlus className="w-4 h-4" />} label="افزودن دانش‌آموز" />
          <QuickLink href="/admin/fees" icon={<TrendingUp className="w-4 h-4" />} label="مدیریت شهریه" />
          <QuickLink href="/admin/settings" icon={<Calendar className="w-4 h-4" />} label="سال تحصیلی" />
          <QuickLink href="/admin/reports" icon={<FileText className="w-4 h-4" />} label="گزارش‌ها" />
        </div>
      </div>

      {/* Recent Activity (placeholder) */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <div className="font-semibold mb-3">فعالیت‌های اخیر</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500">
                <th className="text-right py-2 border-b">رویداد</th>
                <th className="text-right py-2 border-b">کاربر</th>
                <th className="text-right py-2 border-b">تاریخ</th>
                <th className="text-right py-2 border-b">جزئیات</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="py-2 border-b">تعریف سال تحصیلی</td>
                <td className="py-2 border-b">ادمین</td>
                <td className="py-2 border-b">امروز</td>
                <td className="py-2 border-b text-gray-500">۱۴۰۴-۱۴۰۵</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-2 border-b">تغییر سال جاری</td>
                <td className="py-2 border-b">ادمین</td>
                <td className="py-2 border-b">دیروز</td>
                <td className="py-2 border-b text-gray-500">۱۴۰۴-۱۴۰۵ → فعال</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-2">ایجاد کاربر</td>
                <td className="py-2">مسئول ثبت‌نام</td>
                <td className="py-2">این هفته</td>
                <td className="py-2 text-gray-500">user: registrar01</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function StatCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 text-2xl font-bold text-gray-900">{value}</div>
      {hint ? <div className="mt-1 text-xs text-gray-500">{hint}</div> : null}
    </div>
  );
}

function QuickLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2 w-full border rounded-lg px-3 py-2 hover:bg-gray-50 transition"
    >
      <span className="rounded-md border bg-white p-1.5 group-hover:border-gray-300">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
