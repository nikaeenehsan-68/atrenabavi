"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewExamTitlePage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", status: "active" as "active"|"inactive" });
  const [msg, setMsg] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    if (!form.name.trim()) return setMsg("عنوان الزامی است");
    setLoading(true);
    try {
      const r = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const t = await r.text(); let j:any; try{ j=JSON.parse(t);}catch{}
      if (!r.ok) throw new Error(j?.message || "خطا در ثبت");
      setMsg("با موفقیت ثبت شد");
      setTimeout(()=>router.push("/admin/exams"), 600);
    } catch (e:any) {
      setMsg(e?.message || "خطا");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5 md:p-7" dir="rtl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl md:text-2xl font-extrabold">افزودن عنوان امتحان</h1>
        <Link href="/admin/exams" className="text-sm text-teal-700 hover:underline">بازگشت به لیست</Link>
      </div>

      {msg && <div className="mb-4 text-sm px-3 py-2 rounded-lg border bg-amber-50 border-amber-200 text-amber-800">{msg}</div>}

      <form onSubmit={submit} className="grid md:grid-cols-2 gap-3">
        <label className="block md:col-span-2">
          <div className="mb-1 text-sm text-gray-600">عنوان</div>
          <input className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
            value={form.name} onChange={(e)=>setForm(f=>({...f, name: e.target.value}))} required />
        </label>
        <label className="block">
          <div className="mb-1 text-sm text-gray-600">وضعیت</div>
          <select className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
            value={form.status} onChange={(e)=>setForm(f=>({...f, status: e.target.value as any}))}>
            <option value="active">فعال</option>
            <option value="inactive">غیرفعال</option>
          </select>
        </label>

        <div className="md:col-span-2 flex items-center gap-3">
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-60 shadow-sm">
            {loading ? "در حال ثبت..." : "ثبت عنوان"}
          </button>
          <Link href="/admin/exams" className="px-5 py-2.5 rounded-xl border hover:bg-gray-50">انصراف</Link>
        </div>
      </form>
    </div>
  );
}