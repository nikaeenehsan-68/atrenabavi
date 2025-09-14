"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  School, Users, UserCog, Wallet, Calendar, Menu, ChevronDown, Dot, Settings
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-teal-50 to-emerald-50 border">
              <School className="w-5 h-5 text-teal-600" />
            </div>
            <span className="font-bold">پنل مدیریت عطر نبوی</span>
          </div>

          <button
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50"
          >
            <Menu className="w-4 h-4" />
            منو
          </button>

          <nav className="hidden md:flex items-center gap-4 text-sm text-gray-600">
            <HeaderLink href="/admin">داشبورد</HeaderLink>
            <HeaderLink href="/admin/settings">تنظیمات</HeaderLink>
          </nav>
        </div>

        {/* mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="mx-auto max-w-6xl px-4 py-3">
              <MobileMenu />
            </div>
          </div>
        )}
      </header>

      <div className="mx-auto max-w-6xl px-4 md:px-6 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="md:col-span-3 lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="px-4 py-3 border-b font-semibold bg-gradient-to-l from-slate-50 to-white">
              منو
            </div>
            <nav className="p-2 space-y-1">
              <NavLink href="/admin" icon={<Calendar className="w-4 h-4" />}>داشبورد</NavLink>

              {/* دانش‌آموزان با زیرمنو */}
              <NavGroup icon={<Users className="w-4 h-4" />} label="دانش‌آموزان">
                <SubLink href="/admin/students">📋 لیست دانش‌آموزان</SubLink>
                <SubLink href="/admin/enrollments">📝 ثبت‌نام</SubLink>
              </NavGroup>

              {/* همکاران با زیرمنو */}
              <NavGroup icon={<UserCog className="w-4 h-4" />} label="همکاران">
                <SubLink href="/admin/users/new">➕ افزودن همکار</SubLink>
                <SubLink href="/admin/users">📋 لیست همکاران</SubLink>
                <SubLink href="/admin/staff-roles">⚙️ نقش‌ها</SubLink>
              </NavGroup>

              <NavLink href="/admin/fees" icon={<Wallet className="w-4 h-4" />}>شهریه</NavLink>

              {/* تنظیمات سال جاری با زیرمنو */}
              <NavGroup icon={<Settings className="w-4 h-4" />} label="تنظیمات سال جاری">
                <SubLink href="/admin/academic-terms">📚 دوره‌های تحصیلی</SubLink>
                <SubLink href="/admin/grade-levels">🏷️ پایه‌های تحصیلی</SubLink>
                <SubLink href="/admin/classes">🏫 کلاس‌ها</SubLink>
                <SubLink href="/admin/textbooks">📖 کتاب‌های درسی</SubLink>
                <SubLink href="/admin/exams">🧪 امتحانات</SubLink>
              </NavGroup>
            </nav>
          </div>
        </aside>

        {/* Main */}
        <main className="md:col-span-9 lg:col-span-9">{children}</main>
      </div>
    </div>
  );
}

/* ---------- Header small link ---------- */
function HeaderLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`px-2 py-1 rounded-md transition-colors ${
        active ? "text-gray-900 bg-gray-100" : "hover:text-gray-900"
      }`}
    >
      {children}
    </Link>
  );
}

/* ---------- Main Nav Link (level 1) ---------- */
function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors",
        "hover:bg-gray-100 text-gray-700",
        active ? "bg-gray-100 border border-gray-200" : "border border-transparent",
      ].join(" ")}
    >
      {icon}
      <span className="font-medium">{children}</span>
    </Link>
  );
}

/* ---------- Nav Group (level 1 with submenu) ---------- */
function NavGroup({
  icon,
  label,
  children,
  defaultOpen = true,
}: {
  icon?: ReactNode;
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-gray-100 border border-transparent"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{label}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Submenu container – متمایز از منوی اصلی */}
      <div
        className={[
          "grid transition-[grid-template-rows] duration-200 ease-in-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        ].join(" ")}
      >
        <div
          className={[
            "overflow-hidden",
            "mt-1 mr-3",                    // فاصله از راست
            "rounded-xl bg-gray-50/80",     // پس‌زمینه ملایم
            "border border-gray-100",       // کادر ظریف اطراف
            "pr-3",                         // تو رفتگی RTL
            "border-r-4 border-r-teal-200", // خط عمودی متمایز سمت راست
          ].join(" ")}
        >
          <div className="py-1.5 space-y-0.5">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Sub Link (level 2) ---------- */
function SubLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-2",
        "px-3 py-2 rounded-lg text-[13px] transition-colors",
        active
          ? "bg-white border border-gray-200 shadow-sm"
          : "hover:bg-white/70 border border-transparent",
        "text-gray-700",
      ].join(" ")}
    >
      <Dot className="w-4 h-4 -mr-1" />
      <span>{children}</span>
    </Link>
  );
}

/* ---------- Mobile condensed menu ---------- */
function MobileMenu() {
  return (
    <div className="grid gap-2 text-sm">
      <Link className="px-3 py-2 rounded-lg border hover:bg-gray-50" href="/admin">داشبورد</Link>

      {/* دانش‌آموزان (موبایل) */}
      <div className="rounded-lg border p-2">
        <div className="px-1 pb-1 text-gray-700 font-medium flex items-center gap-2">
          <Users className="w-4 h-4" /> دانش‌آموزان
        </div>
        <div className="grid gap-1">
          <Link className="px-3 py-2 rounded-md hover:bg-gray-50 text-gray-700" href="/admin/students">📋 لیست دانش‌آموزان</Link>
          <Link className="px-3 py-2 rounded-md hover:bg-gray-50 text-gray-700" href="/admin/enrollments">📝 ثبت‌نام</Link>
        </div>
      </div>

      {/* همکاران (موبایل) */}
      <div className="rounded-lg border p-2">
        <div className="px-1 pb-1 text-gray-700 font-medium flex items-center gap-2">
          <UserCog className="w-4 h-4" /> همکاران
        </div>
        <div className="grid gap-1">
          <Link className="px-3 py-2 rounded-md hover:bg-gray-50 text-gray-700" href="/admin/users/new">➕ افزودن همکار</Link>
          <Link className="px-3 py-2 rounded-md hover:bg-gray-50 text-gray-700" href="/admin/users">📋 لیست همکاران</Link>
          <Link className="px-3 py-2 rounded-md hover:bg-gray-50 text-gray-700" href="/admin/staff-roles">⚙️ نقش‌ها</Link>
        </div>
      </div>

      <Link className="px-3 py-2 rounded-lg border hover:bg-gray-50" href="/admin/fees">شهریه</Link>

      {/* تنظیمات سال جاری (موبایل) */}
      <div className="rounded-lg border p-2">
        <div className="px-1 pb-1 text-gray-700 font-medium flex items-center gap-2">
          <Settings className="w-4 h-4" /> تنظیمات سال جاری
        </div>
        <div className="grid gap-1">
          <Link className="px-3 py-2 rounded-md hover:bg-gray-50 text-gray-700" href="/admin/academic-terms">📚 دوره‌های تحصیلی</Link>
          <Link className="px-3 py-2 rounded-md hover:bg-gray-50 text-gray-700" href="/admin/grade-levels">🏷️ پایه‌های تحصیلی</Link>
          <Link className="px-3 py-2 rounded-md hover:bg-gray-50 text-gray-700" href="/admin/classes">🏫 کلاس‌ها</Link>
          <Link className="px-3 py-2 rounded-md hover:bg-gray-50 text-gray-700" href="/admin/textbooks">📖 کتاب‌های درسی</Link>
          <Link className="px-3 py-2 rounded-md hover:bg-gray-50 text-gray-700" href="/admin/exams">🧪 امتحانات</Link>
        </div>
      </div>
    </div>
  );
}
