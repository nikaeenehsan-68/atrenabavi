"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import gregorian from "react-date-object/calendars/gregorian";
import persian_fa from "react-date-object/locales/persian_fa";

/* ----------------------- Helpers: digits & J->G ----------------------- */
const faDigits = /[۰-۹]/g;
const fa2enMap: Record<string, string> = {
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
  "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
};
function normalizeDigits(s?: string | null) {
  if (!s) return s ?? "";
  return s.replace(faDigits, (d) => fa2enMap[d]).trim();
}

type FormT = {
  // دانش‌آموز
  first_name: string;
  last_name: string;
  national_code: string;
  birth_certificate_no?: string;
  birth_certificate_place?: string;
  birth_certificate_id?: string;
  birth_date?: string; // میلادی (ارسال)
  birth_place?: string;
  photo?: string;

  // پدر
  father_name: string;
  father_national_code: string;
  father_birth_date?: string; // میلادی (ارسال)
  father_mobile?: string;
  father_birth_certificate_place?: string;
  father_education?: string;
  father_job?: string;

  // مادر
  mother_first_name: string;
  mother_last_name: string;
  mother_national_code: string;
  mother_birth_date?: string; // میلادی (ارسال)
  mother_mobile?: string;
  mother_education?: string;
  mother_job?: string;

  // سایر
  guardian: "father" | "mother" | "other";
  address?: string;
  home_phone?: string;
  status?: string;
};

export default function NewStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // تاریخ‌های ورودی با DateObject (شمسی) نگه داشته می‌شن
  const [birthJ, setBirthJ] = useState<DateObject | null>(null);
  const [fatherBirthJ, setFatherBirthJ] = useState<DateObject | null>(null);
  const [motherBirthJ, setMotherBirthJ] = useState<DateObject | null>(null);

  const [form, setForm] = useState<FormT>({
    first_name: "",
    last_name: "",
    national_code: "",
    birth_certificate_no: "",
    birth_certificate_place: "",
    birth_certificate_id: "",
    birth_place: "",
    photo: "",

    father_name: "",
    father_national_code: "",
    father_mobile: "",
    father_birth_certificate_place: "",
    father_education: "",
    father_job: "",

    mother_first_name: "",
    mother_last_name: "",
    mother_national_code: "",
    mother_mobile: "",
    mother_education: "",
    mother_job: "",

    guardian: "father",
    address: "",
    home_phone: "",
    status: "فعال",
  });

  const h = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // تبدیل تاریخ‌های شمسی انتخاب‌شده به میلادی برای ارسال
  function j2g(d?: DateObject | null) {
    if (!d) return undefined;
    const g = new DateObject(d).convert(gregorian);
    return g.format("YYYY-MM-DD");
  }

  function buildPayload(): FormT {
    const cleaned: any = {};
    for (const [k, v] of Object.entries(form)) {
      const val = typeof v === "string" ? v.trim() : v;
      cleaned[k] = val === "" || val === null ? undefined : val;
    }
    // اعداد فارسی → انگلیسی
    const codeKeys = ["national_code", "father_national_code", "mother_national_code", "home_phone", "father_mobile", "mother_mobile"] as const;
    for (const key of codeKeys) if (typeof cleaned[key] === "string") cleaned[key] = normalizeDigits(cleaned[key]);

    // تاریخ‌ها
    cleaned.birth_date = j2g(birthJ);
    cleaned.father_birth_date = j2g(fatherBirthJ);
    cleaned.mother_birth_date = j2g(motherBirthJ);

    return cleaned as FormT;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    // ولیدیشن مینیمال سمت کلاینت
    if (!form.first_name || !form.last_name) return setMsg("نام و نام خانوادگی الزامی است.");
    if (!/^\d{10}$/.test(normalizeDigits(form.national_code))) return setMsg("کد ملی دانش‌آموز باید ۱۰ رقم باشد.");
    if (!/^\d{10}$/.test(normalizeDigits(form.father_national_code || ""))) return setMsg("کد ملی پدر باید ۱۰ رقم باشد.");
    if (!/^\d{10}$/.test(normalizeDigits(form.mother_national_code || ""))) return setMsg("کد ملی مادر باید ۱۰ رقم باشد.");

    const payload = buildPayload();

    setLoading(true);
    try {
      const r = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const raw = await r.text();
      let data: any; try { data = JSON.parse(raw); } catch {}

      if (!r.ok) {
        const readable =
          Array.isArray(data?.message) ? data.message.join("، ") :
          (typeof data?.message === "string" ? data.message : "خطای نامشخص");
        throw new Error(readable);
      }

      setMsg("با موفقیت ثبت شد");
      setTimeout(() => router.push("/admin/students"), 500);
    } catch (err: any) {
      setMsg(err?.message || "ثبت نشد. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5 md:p-7">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl md:text-2xl font-extrabold">افزودن دانش‌آموز</h1>
        <Link href="/admin/students" className="text-sm text-teal-700 hover:underline">بازگشت به لیست</Link>
      </div>

      {msg && (
        <div className="mb-5 text-sm px-3 py-2 rounded-lg border bg-amber-50 border-amber-200 text-amber-800">
          {msg}
        </div>
      )}

      <form onSubmit={submit} className="space-y-8" dir="rtl">
        {/* دانش‌آموز */}
        <Section title="مشخصات دانش‌آموز">
          <Grid>
            <Field label="نام" required>
              <Input name="first_name" value={form.first_name} onChange={h} />
            </Field>
            <Field label="نام خانوادگی" required>
              <Input name="last_name" value={form.last_name} onChange={h} />
            </Field>
            <Field label="کد ملی دانش‌آموز (۱۰ رقم)" required>
              <Input name="national_code" value={form.national_code} onChange={h} inputMode="numeric" dir="ltr" maxLength={10} />
            </Field>
            <Field label="شماره شناسنامه">
              <Input name="birth_certificate_no" value={form.birth_certificate_no} onChange={h} />
            </Field>
            <Field label="محل صدور">
              <Input name="birth_certificate_place" value={form.birth_certificate_place} onChange={h} />
            </Field>
            <Field label="شناسه شناسنامه">
              <Input name="birth_certificate_id" value={form.birth_certificate_id} onChange={h} />
            </Field>
            <Field label="تاریخ تولد (شمسی)">
              <DateField value={birthJ} onChange={setBirthJ} />
            </Field>
            <Field label="محل تولد">
              <Input name="birth_place" value={form.birth_place} onChange={h} />
            </Field>
            <Field label="مسیر عکس (اختیاری)">
              <Input name="photo" value={form.photo} onChange={h} placeholder="/uploads/students/..." dir="ltr" />
            </Field>
          </Grid>
        </Section>

        {/* پدر */}
        <Section title="مشخصات پدر">
          <Grid>
            <Field label="نام پدر" required>
              <Input name="father_name" value={form.father_name} onChange={h} />
            </Field>
            <Field label="کد ملی پدر (۱۰ رقم)" required>
              <Input name="father_national_code" value={form.father_national_code} onChange={h} inputMode="numeric" dir="ltr" maxLength={10} />
            </Field>
            <Field label="تاریخ تولد پدر (شمسی)">
              <DateField value={fatherBirthJ} onChange={setFatherBirthJ} />
            </Field>
            <Field label="شماره همراه پدر">
              <Input name="father_mobile" value={form.father_mobile} onChange={h} placeholder="09xxxxxxxxx" dir="ltr" inputMode="numeric" />
            </Field>
            <Field label="محل صدور پدر">
              <Input name="father_birth_certificate_place" value={form.father_birth_certificate_place} onChange={h} />
            </Field>
            <Field label="مدرک تحصیلی پدر">
              <Input name="father_education" value={form.father_education} onChange={h} />
            </Field>
            <Field label="شغل پدر">
              <Input name="father_job" value={form.father_job} onChange={h} />
            </Field>
          </Grid>
        </Section>

        {/* مادر */}
        <Section title="مشخصات مادر">
          <Grid>
            <Field label="نام مادر" required>
              <Input name="mother_first_name" value={form.mother_first_name} onChange={h} />
            </Field>
            <Field label="نام خانوادگی مادر" required>
              <Input name="mother_last_name" value={form.mother_last_name} onChange={h} />
            </Field>
            <Field label="کد ملی مادر (۱۰ رقم)" required>
              <Input name="mother_national_code" value={form.mother_national_code} onChange={h} inputMode="numeric" dir="ltr" maxLength={10} />
            </Field>
            <Field label="تاریخ تولد مادر (شمسی)">
              <DateField value={motherBirthJ} onChange={setMotherBirthJ} />
            </Field>
            <Field label="شماره همراه مادر">
              <Input name="mother_mobile" value={form.mother_mobile} onChange={h} placeholder="09xxxxxxxxx" dir="ltr" inputMode="numeric" />
            </Field>
            <Field label="مدرک تحصیلی مادر">
              <Input name="mother_education" value={form.mother_education} onChange={h} />
            </Field>
            <Field label="شغل مادر">
              <Input name="mother_job" value={form.mother_job} onChange={h} />
            </Field>
          </Grid>
        </Section>

        {/* سایر */}
        <Section title="سرپرست، آدرس و وضعیت">
          <Grid>
            <Field label="سرپرست">
              <select
                name="guardian"
                value={form.guardian}
                onChange={h}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
              >
                <option value="father">پدر</option>
                <option value="mother">مادر</option>
                <option value="other">سایر</option>
              </select>
            </Field>
            <Field label="تلفن منزل">
              <Input name="home_phone" value={form.home_phone} onChange={h} dir="ltr" inputMode="numeric" />
            </Field>
            <Field label="وضعیت">
              <Input name="status" value={form.status} onChange={h} placeholder="فعال / انتقالی / ..." />
            </Field>
            {/* آدرس: تمام عرض در دسکتاپ */}
            <Field label="آدرس منزل" wide>
              <textarea
                name="address"
                value={form.address}
                onChange={h}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 h-28"
              />
            </Field>
          </Grid>
        </Section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-60 shadow-sm"
          >
            {loading ? "در حال ثبت..." : "ثبت دانش‌آموز"}
          </button>
          <Link href="/admin/students" className="px-5 py-2.5 rounded-xl border hover:bg-gray-50">انصراف</Link>
        </div>
      </form>
    </div>
  );
}

/* ----------------------- UI bits ----------------------- */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 border border-gray-100 rounded-xl p-4 md:p-5 bg-white shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
      <div className="font-semibold text-gray-800">{title}</div>
      {children}
    </section>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}
function Field({ label, required, wide, children }: { label: string; required?: boolean; wide?: boolean; children: React.ReactNode }) {
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
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 ${props.className || ""}`}
    />
  );
}
// فیلد تاریخ شمسی (React Multi Date Picker)
function DateField({ value, onChange }: { value: DateObject | null; onChange: (d: DateObject | null) => void; }) {
  return (
    <DatePicker
      value={value as any}
      onChange={(d: any) => onChange(d ?? null)}
      calendar={persian}
      locale={persian_fa}
      inputClass="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 bg-white text-right"
      calendarPosition="bottom-right"
      format="YYYY/MM/DD"
      editable={false}
      animations={[]}
      style={{ width: "100%" }}
    />
  );
}
