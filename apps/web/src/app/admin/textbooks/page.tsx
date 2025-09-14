"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Year = { id: number; title?: string };
type Row = {
  id: number;
  name: string;
  grade_level_id: number;
  academic_year_id: number;
  grade_level?: { id: number; name: string } | null;
};

export default function TextbooksListPage() {
  const [year, setYear] = useState<Year | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [grades, setGrades] = useState<{ id:number; name:string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<Row | null>(null);
  const [editForm, setEditForm] = useState({ name: "", grade_level_id: 0 });

  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const y = await fetch("/api/academic-years/current", { cache: "no-store" }).then(r=>r.json()).catch(()=>null);
      setYear(y || null);
      if (y?.id) {
        const [tb, gr] = await Promise.all([
          fetch(`/api/textbooks?academic_year_id=${y.id}`, { cache: "no-store" }).then(async r=>{const t=await r.text(); try{return JSON.parse(t)}catch{return []}}),
          fetch(`/api/grade-levels`, { cache: "no-store" }).then(async r=>{const t=await r.text(); try{return JSON.parse(t)}catch{return []}}),
        ]);
        setRows(Array.isArray(tb) ? tb : []);
        setGrades(Array.isArray(gr) ? gr.map((x:any)=>({id:x.id,name:x.name})) : []);
      } else {
        setRows([]);
      }
    } catch (e:any) {
      setErr(e?.message || "خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ---------- Edit ---------- */
  function openEdit(r: Row) {
    setEditTarget(r);
    setEditForm({ name: r.name || "", grade_level_id: r.grade_level_id });
    setMsg(null); setErr(null);
  }
  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setErr(null);
    try {
      const r = await fetch(`/api/textbooks/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name?.trim() || undefined,
          grade_level_id: editForm.grade_level_id || undefined,
        }),
      });
      const txt = await r.text(); let j:any; try{ j=JSON.parse(txt);}catch{}
      if (!r.ok) throw new Error(Array.isArray(j?.message) ? j.message.join("، ") : (j?.message || "خطا در ذخیره ویرایش"));
      setMsg("با موفقیت ذخیره شد");
      setEditTarget(null); load();
    } catch (e:any) {
      setErr(e?.message || "خطا در ذخیره ویرایش");
    }
  }

  /* ---------- Delete ---------- */
  function openDelete(r: Row) {
    setDeleteTarget(r);
    setMsg(null); setErr(null);
  }
  async function confirmDelete() {
    if (!deleteTarget) return;
    setErr(null);
    try {
      const r = await fetch(`/api/textbooks/${deleteTarget.id}`, { method: "DELETE" });
      const txt = await r.text(); let j:any; try{ j=JSON.parse(txt);}catch{}
      if (!r.ok) throw new Error(j?.message || "خطا در حذف");
      setMsg("با موفقیت حذف شد");
      setDeleteTarget(null); load();
    } catch (e:any) {
      setErr(e?.message || "خطا در حذف");
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5 md:p-7" dir="rtl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl md:text-2xl font-extrabold">لیست درس‌ها {year?.title ? `- ${year.title}` : ""}</h1>
        <Link href="/admin/textbooks/new" className="px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-sm">
          افزودن درس
        </Link>
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
          <div className="text-gray-500 text-sm">درسی برای سال جاری ثبت نشده است.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500">
                <th className="text-right py-2 border-b">نام</th>
                <th className="text-right py-2 border-b">پایه</th>
                <th className="text-right py-2 border-b">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="py-2 border-b">{r.name}</td>
                  <td className="py-2 border-b">{r.grade_level?.name || `#${r.grade_level_id}`}</td>
                  <td className="py-2 border-b">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(r)} className="px-3 py-1 rounded-xl border hover:bg-gray-100">ویرایش</button>
                      <button onClick={() => openDelete(r)} className="px-3 py-1 rounded-xl border border-red-300 text-red-700 hover:bg-red-50">حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <Modal onClose={() => setEditTarget(null)}>
          <div className="font-semibold mb-3">ویرایش درس</div>
          <form onSubmit={saveEdit} className="grid md:grid-cols-2 gap-3">
            <label className="block md:col-span-2">
              <div className="mb-1 text-sm text-gray-600">نام</div>
              <input
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                value={editForm.name}
                onChange={(e)=>setEditForm(f=>({...f, name: e.target.value}))}
                required
              />
            </label>
            <label className="block md:col-span-2">
              <div className="mb-1 text-sm text-gray-600">پایه</div>
              <select
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                value={editForm.grade_level_id}
                onChange={(e)=>setEditForm(f=>({...f, grade_level_id: Number(e.target.value)}))}
              >
                {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </label>
            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" className="px-4 py-2 rounded-xl border" onClick={() => setEditTarget(null)}>انصراف</button>
              <button className="px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700">ذخیره</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <div className="font-semibold mb-2">حذف درس</div>
          <p className="text-sm text-gray-600 mb-4">
            آیا از حذف <b>{deleteTarget.name}</b> مطمئن هستید؟ این عمل قابل بازگشت نیست.
          </p>
          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 rounded-xl border" onClick={() => setDeleteTarget(null)}>انصراف</button>
            <button className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700" onClick={confirmDelete}>تأیید حذف</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
