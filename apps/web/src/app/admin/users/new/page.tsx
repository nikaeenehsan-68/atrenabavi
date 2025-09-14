"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// استفاده از همان پکیج/کامپوننت‌های تاریخ پروژه
import DateField from "@/components/DateField";
import { fromJalali, isGregorian, normalizeDigits } from "@/lib/date";

export default function NewUserPage() {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    national_id: "",
    username: "",
    password: "",
    phone: "",
    birth_date: "", // جلالی در UI؛ قبل از ارسال میلادی می‌کنیم
    birth_certificate_identifier: "",
    birth_certificate_issue_place: "",
    birth_place: "",
    father_name: "",
    mother_first_name: "",
    mother_last_name: "",
    spouse_first_name: "",
    spouse_last_name: "",
    spouse_mobile: "",
    home_address: "",
    home_phone: "",
    marital_status: "",
    children_count: 0,
    bank_card_number: "",
    bank_account_number: "",
    bank_sheba_number: "",
    bank_name: "",
    is_active: true,
  });

  const h = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target as any;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    // اعتبارسنجی ساده
    if (!form.first_name.trim() || !form.last_name.trim())
      return setMsg("نام و نام خانوادگی الزامی است.");
    if (!form.username.trim()) return setMsg("نام کاربری الزامی است.");
    if (
      (form.national_id || "").trim() &&
      !/^\d{10}$/.test(normalizeDigits(form.national_id))
    )
      return setMsg("کد ملی باید ۱۰ رقم باشد.");
    if ((form.password || "").length < 6)
      return setMsg("رمز عبور حداقل ۶ کاراکتر باشد.");

    // تبدیل تاریخ: اگر جلالی بود → میلادی (YYYY-MM-DD)
    const birth_date = form.birth_date
      ? isGregorian(form.birth_date)
        ? normalizeDigits(form.birth_date)
        : fromJalali(form.birth_date) // خروجی: YYYY-MM-DD
      : undefined;

    setLoading(true);
    try {
      const r = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          national_id: normalizeDigits(form.national_id || ""),
          phone: normalizeDigits(form.phone || ""),
          home_phone: normalizeDigits(form.home_phone || ""),
          spouse_mobile: normalizeDigits(form.spouse_mobile || ""),
          bank_card_number: normalizeDigits(form.bank_card_number || ""),
          bank_account_number: normalizeDigits(form.bank_account_number || ""),
          bank_sheba_number: normalizeDigits(form.bank_sheba_number || ""),
          children_count: Number(form.children_count || 0),
          birth_date, // میلادی
        }),
      });

      const txt = await r.text();
      let data: any;
      try {
        data = JSON.parse(txt);
      } catch {}

      if (!r.ok) {
        throw new Error(
          Array.isArray(data?.message)
            ? data.message.join("، ")
            : data?.message || "خطا در ایجاد همکار"
        );
      }

      setMsg("همکار با موفقیت ثبت شد");
      setTimeout(() => router.push("/admin/users"), 600);
    } catch (e: any) {
      setMsg(e?.message || "خطا در ثبت");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5 md:p-7" dir="rtl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl md:text-2xl font-extrabold">افزودن همکار</h1>
        <Link
          href="/admin/users"
          className="text-sm text-teal-700 hover:underline"
        >
          بازگشت به لیست
        </Link>
      </div>

      {msg && (
        <div className="mb-5 text-sm px-3 py-2 rounded-lg border bg-amber-50 border-amber-200 text-amber-800">
          {msg}
        </div>
      )}

      <form onSubmit={submit} className="space-y-6">
        <Section title="مشخصات فردی">
          <Grid>
            <Field label="نام" required>
              <Input name="first_name" value={form.first_name} onChange={h} />
            </Field>
            <Field label="نام خانوادگی" required>
              <Input name="last_name" value={form.last_name} onChange={h} />
            </Field>
            <Field label="کد ملی (۱۰ رقم)">
              <Input
                name="national_id"
                value={form.national_id}
                onChange={h}
                dir="ltr"
                inputMode="numeric"
              />
            </Field>
            <Field label="نام کاربری" required>
              <Input
                name="username"
                value={form.username}
                onChange={h}
                dir="ltr"
              />
            </Field>
            <Field label="رمز عبور" required>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={h}
                  dir="ltr"
                  className="pl-20" // فضای چپ برای دکمه نمایش
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute inset-y-0 left-2 my-auto h-8 px-2 text-xs rounded-lg border bg-white hover:bg-gray-50"
                  aria-label={showPass ? "پنهان کردن رمز" : "نمایش رمز"}
                >
                  {showPass ? "پنهان" : "نمایش"}
                </button>
              </div>
            </Field>

            <Field label="تلفن">
              <Input
                name="phone"
                value={form.phone}
                onChange={h}
                dir="ltr"
                inputMode="tel"
              />
            </Field>

            {/* تاریخ تولد با تقویم شمسی (DateField) */}
            <DateField
  label="تاریخ تولد (جلالی)"
  value={form.birth_date}
  onChange={(val) => setForm((f) => ({ ...f, birth_date: val }))}
  calendarPosition="bottom-right"
  portal
/>

            <Field label="محل تولد">
              <Input name="birth_place" value={form.birth_place} onChange={h} />
            </Field>
            <Field label="شناسه شناسنامه">
              <Input
                name="birth_certificate_identifier"
                value={form.birth_certificate_identifier}
                onChange={h}
              />
            </Field>
            <Field label="محل صدور شناسنامه">
              <Input
                name="birth_certificate_issue_place"
                value={form.birth_certificate_issue_place}
                onChange={h}
              />
            </Field>
          </Grid>
        </Section>

        <Section title="اطلاعات خانواده">
          <Grid>
            <Field label="نام پدر">
              <Input name="father_name" value={form.father_name} onChange={h} />
            </Field>
            <Field label="نام مادر">
              <Input
                name="mother_first_name"
                value={form.mother_first_name}
                onChange={h}
              />
            </Field>
            <Field label="نام خانوادگی مادر">
              <Input
                name="mother_last_name"
                value={form.mother_last_name}
                onChange={h}
              />
            </Field>
            <Field label="نام همسر">
              <Input
                name="spouse_first_name"
                value={form.spouse_first_name}
                onChange={h}
              />
            </Field>
            <Field label="نام خانوادگی همسر">
              <Input
                name="spouse_last_name"
                value={form.spouse_last_name}
                onChange={h}
              />
            </Field>
            <Field label="موبایل همسر">
              <Input
                name="spouse_mobile"
                value={form.spouse_mobile}
                onChange={h}
                dir="ltr"
                inputMode="tel"
              />
            </Field>
          </Grid>
        </Section>

        <Section title="نشانی و وضعیت">
          <Grid>
            <Field label="تلفن منزل">
              <Input
                name="home_phone"
                value={form.home_phone}
                onChange={h}
                dir="ltr"
                inputMode="tel"
              />
            </Field>
            <Field label="وضعیت تأهل">
              <Select
                name="marital_status"
                value={form.marital_status}
                onChange={h}
              >
                <option value="">نامشخص</option>
                <option value="single">مجرد</option>
                <option value="married">متاهل</option>
              </Select>
            </Field>
            <Field label="تعداد فرزندان">
              <Input
                name="children_count"
                value={form.children_count as any}
                onChange={h}
                type="number"
                min={0}
                dir="ltr"
              />
            </Field>
            {/* آدرس: تمام عرض */}
            <Field label="آدرس منزل" wide>
              <Textarea
                name="home_address"
                value={form.home_address}
                onChange={h}
                rows={4}
              />
            </Field>
          </Grid>
        </Section>

        <Section title="اطلاعات بانکی">
          <Grid>
            <Field label="شماره کارت">
              <Input
                name="bank_card_number"
                value={form.bank_card_number}
                onChange={h}
                dir="ltr"
              />
            </Field>
            <Field label="شماره حساب">
              <Input
                name="bank_account_number"
                value={form.bank_account_number}
                onChange={h}
                dir="ltr"
              />
            </Field>
            <Field label="شماره شبا">
              <Input
                name="bank_sheba_number"
                value={form.bank_sheba_number}
                onChange={h}
                dir="ltr"
              />
            </Field>
            <Field label="نام بانک">
              <Input name="bank_name" value={form.bank_name} onChange={h} />
            </Field>
            <label className="flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={h}
              />
              <span className="text-sm text-gray-700">فعال</span>
            </label>
          </Grid>
        </Section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-60 shadow-sm"
          >
            {loading ? "در حال ثبت..." : "ثبت همکار"}
          </button>
          <Link
            href="/admin/users"
            className="px-5 py-2.5 rounded-xl border hover:bg-gray-50"
          >
            انصراف
          </Link>
        </div>
      </form>
    </div>
  );
}

/* ---------- UI bits (بدون وابستگی به استایل سراسری) ---------- */
const inpBase =
  "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white " +
  "focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 border border-gray-100 rounded-xl p-4 md:p-5 bg-white shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
      <div className="font-semibold text-gray-800">{title}</div>
      {children}
    </section>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  );
}
function Field({
  label,
  required,
  wide,
  children,
}: {
  label: string;
  required?: boolean;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${wide ? "md:col-span-2" : ""}`}>
      <div className="mb-1 text-sm text-gray-600">
        {label} {required ? <span className="text-rose-600">*</span> : null}
      </div>
      {children}
    </label>
  );
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inpBase} ${props.className || ""}`} />;
}
function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${inpBase} ${props.className || ""}`} />
  );
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${inpBase} h-28 ${props.className || ""}`}
    />
  );
}
