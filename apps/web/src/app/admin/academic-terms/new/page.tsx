"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type TermCreate = {
  name: string;
  status: string; // مثلا: "فعال" | "غیرفعال"
};

const STATUS_OPTIONS = ["فعال", "غیرفعال"];

export default function NewAcademicTermPage() {
  const router = useRouter();
  const [form, setForm] = useState<TermCreate>({ name: "", status: "فعال" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const h = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!form.name?.trim()) return setMsg("نام دوره الزامی است.");

    setLoading(true);
    try {
      const r = await fetch("/api/academic-terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), status: form.status }),
      });
      const txt = await r.text(); let data: any; try { data = JSON.parse(txt); } catch {}
      if (!r.ok) throw new Error(Array.isArray(data?.message) ? data.message.join("، ") : (data?.message || "خطا در ایجاد دوره"));

      setMsg("دوره با موفقیت ثبت شد");
      setTimeout(() => router.push("/admin/academic-terms"), 500);
    } catch (e: any) {
      setMsg(e?.message || "ثبت نشد. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5 md:p-7" dir="rtl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl md:text-2xl font-extrabold">افزودن دوره تحصیلی</h1>
        <Link href="/admin/academic-terms" className="text-sm text-teal-700 hover:underline">بازگشت به لیست</Link>
      </div>

      {msg && (
        <div className="mb-5 text-sm px-3 py-2 rounded-lg border bg-amber-50 border-amber-200 text-amber-800">
          {msg}
        </div>
      )}

      <form onSubmit={submit} className="space-y-6">
        <section className="space-y-3 border border-gray-100 rounded-xl p-4 md:p-5 bg-white shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <div className="mb-1 text-sm text-gray-600">نام دوره <span className="text-rose-600">*</span></div>
              <input
                name="name"
                value={form.name}
                onChange={h}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                placeholder="مثلاً ترم اول ۱۴۰۴"
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
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-60 shadow-sm"
          >
            {loading ? "در حال ثبت..." : "ثبت دوره"}
          </button>
          <Link href="/admin/academic-terms" className="px-5 py-2.5 rounded-xl border hover:bg-gray-50">
            انصراف
          </Link>
        </div>
      </form>
    </div>
  );
}
