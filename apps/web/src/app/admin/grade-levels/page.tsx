"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Row = {
  id: number;
  academic_term_id: number;
  grade_code: string;
  name: string;
  status: string;
  academic_term?: { id: number; name: string } | null;
};

const STATUS_OPTIONS = ["فعال", "غیرفعال"];

export default function GradeLevelsListPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [terms, setTerms] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<Row | null>(null);
  const [editForm, setEditForm] = useState({ academic_term_id: 0, grade_code: "", name: "", status: "فعال" });

  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const [r1, r2] = await Promise.all([
        fetch("/api/grade-levels", { cache: "no-store" }).then(async (r) => { const t=await r.text(); try{return JSON.parse(t)}catch{return []} }),
        fetch("/api/academic-terms", { cache: "no-store" }).then(async (r) => { const t=await r.text(); try{return JSON.parse(t)}catch{return []} }),
      ]);
      setRows(Array.isArray(r1) ? r1 : []);
      setTerms(Array.isArray(r2) ? r2.filter((x:any)=>!x.deleted_at) : []);
    } catch (e:any) {
      setErr(e?.message || "خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ---------- Edit ---------- */
  function openEdit(row: Row) {
    setEditTarget(row);
    setEditForm({
      academic_term_id: row.academic_term_id,
      grade_code: row.grade_code || "",
      name: row.name || "",
      status: row.status || "فعال",
    });
    setMsg(null); setErr(null);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setErr(null);
    try {
      const r = await fetch(`/api/grade-levels/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academic_term_id: editForm.academic_term_id || undefined,
          grade_code: editForm.grade_code?.trim() || undefined,
          name: editForm.name?.trim() || undefined,
          status: editForm.status || undefined,
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
  function openDelete(row: Row) {
    setDeleteTarget(row);
    setMsg(null); setErr(null);
  }
  async function confirmDelete() {
    if (!deleteTarget) return;
    setErr(null);
    try {
      const r = await fetch(`/api/grade-levels/${deleteTarget.id}`, { method: "DELETE" });
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
        <h1 className="text-xl md:text-2xl font-extrabold">لیست پایه‌های تحصیلی</h1>
        <Link href="/admin/grade-levels/new" className="px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-sm">
          افزودن پایه
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
          <div className="text-gray-500 text-sm">پایه‌ای ثبت نشده است.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500">
                <th className="text-right py-2 border-b">دوره تحصیلی</th>
                <th className="text-right py-2 border-b">کد پایه</th>
                <th className="text-right py-2 border-b">نام پایه</th>
                <th className="text-right py-2 border-b">وضعیت</th>
                <th className="text-right py-2 border-b">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="py-2 border-b">{r.academic_term?.name || `#${r.academic_term_id}`}</td>
                  <td className="py-2 border-b">{r.grade_code}</td>
                  <td className="py-2 border-b">{r.name}</td>
                  <td className="py-2 border-b">{r.status || "—"}</td>
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
          <div className="font-semibold mb-3">ویرایش پایه</div>
          <form onSubmit={saveEdit} className="grid md:grid-cols-2 gap-3">
            <label className="block">
              <div className="mb-1 text-sm text-gray-600">دوره تحصیلی</div>
              <select
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                value={editForm.academic_term_id}
                onChange={(e) => setEditForm((f)=>({ ...f, academic_term_id: Number(e.target.value) }))}
              >
                {terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
            <label className="block">
              <div className="mb-1 text-sm text-gray-600">کد پایه</div>
              <input
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                value={editForm.grade_code}
                onChange={(e) => setEditForm((f)=>({ ...f, grade_code: e.target.value }))}
                required
              />
            </label>
            <label className="block md:col-span-2">
              <div className="mb-1 text-sm text-gray-600">نام پایه</div>
              <input
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                value={editForm.name}
                onChange={(e) => setEditForm((f)=>({ ...f, name: e.target.value }))}
                required
              />
            </label>
            <label className="block md:col-span-2">
              <div className="mb-1 text-sm text-gray-600">وضعیت</div>
              <select
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                value={editForm.status}
                onChange={(e) => setEditForm((f)=>({ ...f, status: e.target.value }))}
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
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
          <div className="font-semibold mb-2">حذف پایه</div>
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
