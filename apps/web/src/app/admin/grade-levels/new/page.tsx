"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Term = { id: number; name: string; status: string };
type CreatePayload = { academic_term_id: number; grade_code: string; name: string; status: string; };

const STATUS_OPTIONS = ["فعال", "غیرفعال"];

export default function NewGradeLevelPage() {
  const router = useRouter();
  const [terms, setTerms] = useState<Term[]>([]);
  const [form, setForm] = useState<CreatePayload>({ academic_term_id: 0, grade_code: "", name: "", status: "فعال" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/academic-terms", { cache: "no-store" });
        const txt = await r.text(); let j:any; try{ j=JSON.parse(txt);}catch{ j=[]; }
        setTerms(Array.isArray(j) ? j.filter((t:any)=>!t.deleted_at) : []);
      } catch {}
    })();
  }, []);

  const h = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "academic_term_id" ? Number(value) : value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!form.academic_term_id) return setMsg("انتخاب دوره تحصیلی الزامی است.");
    if (!form.grade_code.trim()) return setMsg("کد پایه الزامی است.");
    if (!form.name.trim()) return setMsg("نام پایه الزامی است.");

    setLoading(true);
    try {
      const r = await fetch("/api/grade-levels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academic_term_id: form.academic_term_id,
          grade_code: form.grade_code.trim(),
          name: form.name.trim(),
          status: form.status,
        }),
      });
      const txt = await r.text(); let data:any; try{ data=JSON.parse(txt);}catch{}
      if (!r.ok) throw new Error(Array.isArray(data?.message) ? data.message.join("، ") : (data?.message || "خطا در ایجاد پایه"));

      setMsg("پایه با موفقیت ثبت شد");
      setTimeout(() => router.push("/admin/grade-levels"), 500);
    } catch (e:any) {
      setMsg(e?.message || "ثبت نشد. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5 md:p-7" dir="rtl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl md:text-2xl font-extrabold">افزودن پایه تحصیلی</h1>
        <Link href="/admin/grade-levels" className="text-sm text-teal-700 hover:underline">بازگشت به لیست</Link>
      </div>

      {msg && <div className="mb-5 text-sm px-3 py-2 rounded-lg border bg-amber-50 border-amber-200 text-amber-800">{msg}</div>}

      <form onSubmit={submit} className="space-y-6">
        <section className="space-y-3 border border-gray-100 rounded-xl p-4 md:p-5 bg-white shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <div className="mb-1 text-sm text-gray-600">دوره تحصیلی <span className="text-rose-600">*</span></div>
              <select
                name="academic_term_id"
                value={form.academic_term_id || ""}
                onChange={h}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
              >
                <option value="">— انتخاب کنید —</option>
                {terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>

            <label className="block">
              <div className="mb-1 text-sm text-gray-600">کد پایه <span className="text-rose-600">*</span></div>
              <input
                name="grade_code"
                value={form.grade_code}
                onChange={h}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                placeholder="مثلاً G7"
              />
            </label>

            <label className="block">
              <div className="mb-1 text-sm text-gray-600">نام پایه <span className="text-rose-600">*</span></div>
              <input
                name="name"
                value={form.name}
                onChange={h}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                placeholder="مثلاً هفتم"
              />
            </label>

            <label className="block">
              <div className="mb-1 text-sm text-gray-600">وضعیت</div>
              <select
                name="status"
                value={form.status}
                onChange={h}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-60 shadow-sm">
            {loading ? "در حال ثبت..." : "ثبت پایه"}
          </button>
          <Link href="/admin/grade-levels" className="px-5 py-2.5 rounded-xl border hover:bg-gray-50">انصراف</Link>
        </div>
      </form>
    </div>
  );
}
