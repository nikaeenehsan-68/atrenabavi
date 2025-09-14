"use client";

import { useEffect, useState, useCallback } from "react";
import { Modal } from "@/components/Modal";

type Row = { id: number; name: string; status: "active" | "inactive" };
type Resp = { year: { id: number; title: string }, rows: Row[] };

export default function ExamsListPage() {
  const [year, setYear] = useState<{id:number; title:string} | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [target, setTarget] = useState<Row | null>(null);
  const [form, setForm] = useState({ name: "", status: "active" as "active"|"inactive" });

  const load = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const r = await fetch("/api/exams", { cache: "no-store" });
      const j: Resp = await r.json();
      if (!r.ok) throw new Error((j as any)?.message || "خطا در دریافت داده");
      setYear(j.year || null);
      setRows(Array.isArray(j.rows) ? j.rows : []);
    } catch (e:any) {
      setErr(e?.message || "خطا");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(()=>{ load(); }, [load]);

  function openEdit(row: Row) {
    setTarget(row);
    setForm({ name: row.name, status: row.status });
    setErr(null); setMsg(null);
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!target) return;
    setErr(null);
    try {
      const r = await fetch(`/api/exams/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const t = await r.text(); let j:any; try{ j=JSON.parse(t);}catch{}
      if (!r.ok) throw new Error(j?.message || "خطا در ویرایش");
      setMsg("ویرایش با موفقیت انجام شد");
      setTarget(null);
      load();
    } catch (e:any) {
      setErr(e?.message || "خطا در ویرایش");
    }
  }

  async function onDelete(id: number) {
    setErr(null);
    if (!confirm("حذف این عنوان؟")) return;
    try {
      const r = await fetch(`/api/exams/${id}`, { method: "DELETE" });
      const t = await r.text(); let j:any; try{ j=JSON.parse(t);}catch{}
      if (!r.ok) throw new Error(j?.message || "خطا در حذف");
      setMsg("حذف انجام شد");
      load();
    } catch (e:any) {
      setErr(e?.message || "خطا در حذف");
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5 md:p-7" dir="rtl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl md:text-2xl font-extrabold">عناوین امتحان</h1>
        <div className="flex items-center gap-3">
          {year && <div className="text-sm text-gray-600">سال جاری: <b>{year.title}</b></div>}
          <a href="/admin/exams/new" className="px-3 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700">افزودن عنوان</a>
        </div>
      </div>

      {(msg || err) && (
        <div className={`mb-4 text-sm px-3 py-2 rounded-lg border ${err ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}>
          {err || msg}
        </div>
      )}

      <div className="rounded-xl border bg-white p-4 overflow-x-auto">
        {loading ? (
          <div className="text-gray-500">در حال بارگذاری…</div>
        ) : rows.length === 0 ? (
          <div className="text-gray-500 text-sm">عنوانی ثبت نشده است.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500">
                <th className="text-right py-2 border-b">عنوان</th>
                <th className="text-right py-2 border-b">وضعیت</th>
                <th className="text-right py-2 border-b">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="py-2 border-b">{r.name}</td>
                  <td className="py-2 border-b">{r.status === "active" ? "فعال" : "غیرفعال"}</td>
                  <td className="py-2 border-b">
                    <div className="flex gap-2">
                      <button onClick={()=>openEdit(r)} className="px-3 py-1 rounded border hover:bg-gray-100">ویرایش</button>
                      <button onClick={()=>onDelete(r.id)} className="px-3 py-1 rounded border border-red-300 text-red-700 hover:bg-red-50">حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={!!target} onClose={()=>setTarget(null)} title="ویرایش عنوان">
        <form onSubmit={onSave} className="grid md:grid-cols-2 gap-3">
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
          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded-xl border" onClick={()=>setTarget(null)}>انصراف</button>
            <button className="px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700">ذخیره تغییرات</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}