"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Year = { id: number; title?: string; is_current?: 0 | 1 };
type GradeLevel = { id: number; name: string; grade_code: string; academic_term?: { id: number; name: string } | null };

export default function NewClassPage() {
  const router = useRouter();
  const [year, setYear] = useState<Year | null>(null);
  const [grades, setGrades] = useState<GradeLevel[]>([]);
  const [form, setForm] = useState({ code: "", name: "", grade_level_id: 0 });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [yRes, gRes] = await Promise.all([
          fetch("/api/academic-years/current", { cache: "no-store" }).then(r=>r.json()).catch(()=>null),
          fetch("/api/grade-levels", { cache: "no-store" }).then(async r => { const t=await r.text(); try { return JSON.parse(t) } catch { return [] } }),
        ]);
        setYear(yRes || null);
        setGrades(Array.isArray(gRes) ? gRes : []);
      } catch {}
    })();
  }, []);

  const h = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "grade_level_id" ? Number(value) : value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!form.code.trim()) return setMsg("کد کلاس الزامی است.");
    if (!form.name.trim()) return setMsg("نام کلاس الزامی است.");
    if (!form.grade_level_id) return setMsg("انتخاب پایه الزامی است.");
    if (!year?.id) return setMsg("سال جاری تنظیم نشده است.");

    setLoading(true);
    try {
      const r = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.trim(),
          name: form.name.trim(),
          grade_level_id: form.grade_level_id,
          academic_year_id: year.id, // ست سال جاری
        }),
      });
      const txt = await r.text(); let data:any; try{ data=JSON.parse(txt);}catch{}
      if (!r.ok) throw new Error(Array.isArray(data?.message) ? data.message.join("، ") : (data?.message || "خطا در ایجاد کلاس"));

      setMsg("کلاس با موفقیت ثبت شد");
      setTimeout(() => router.push("/admin/classes"), 500);
    } catch (e:any) {
      setMsg(e?.message || "ثبت نشد. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5 md:p-7" dir="rtl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl md:text-2xl font-extrabold">افزودن کلاس</h1>
        <Link href="/admin/classes" className="text-sm text-teal-700 hover:underline">بازگشت به لیست</Link>
      </div>

      {msg && <div className="mb-5 text-sm px-3 py-2 rounded-lg border bg-amber-50 border-amber-200 text-amber-800">{msg}</div>}

      <form onSubmit={submit} className="space-y-6">
        <section className="space-y-3 border border-gray-100 rounded-xl p-4 md:p-5 bg-white shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <div className="mb-1 text-sm text-gray-600">کد کلاس <span className="text-rose-600">*</span></div>
              <input
                name="code"
                value={form.code}
                onChange={h}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                placeholder="مثلاً C-101"
              />
            </label>

            <label className="block">
              <div className="mb-1 text-sm text-gray-600">نام کلاس <span className="text-rose-600">*</span></div>
              <input
                name="name"
                value={form.name}
                onChange={h}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                placeholder="مثلاً کلاس هفتم الف"
              />
            </label>

            <label className="block">
              <div className="mb-1 text-sm text-gray-600">پایه تحصیلی <span className="text-rose-600">*</span></div>
              <select
                name="grade_level_id"
                value={form.grade_level_id || ""}
                onChange={h}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
              >
                <option value="">— انتخاب کنید —</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} {g.academic_term?.name ? `(${g.academic_term?.name})` : ""}
                  </option>
                ))}
              </select>
            </label>

            <div className="block">
              <div className="mb-1 text-sm text-gray-600">سال تحصیلی</div>
              <input
                value={year?.title || `#${year?.id || ""}`}
                readOnly
                className="w-full rounded-xl border border-dashed border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-600"
              />
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-60 shadow-sm">
            {loading ? "در حال ثبت..." : "ثبت کلاس"}
          </button>
          <Link href="/admin/classes" className="px-5 py-2.5 rounded-xl border hover:bg-gray-50">انصراف</Link>
        </div>
      </form>
    </div>
  );
}
