"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Term = {
  id: number;
  name: string;
  status: string;
  created_at?: string | null;
};

const STATUS_OPTIONS = ["فعال", "غیرفعال"];

export default function AcademicTermsListPage() {
  const [rows, setRows] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<Term | null>(null);
  const [editForm, setEditForm] = useState({ name: "", status: "فعال" });

  const [deleteTarget, setDeleteTarget] = useState<Term | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch("/api/academic-terms", { cache: "no-store" });
      const txt = await r.text(); let j: any; try { j = JSON.parse(txt); } catch { j = []; }
      if (!r.ok) throw new Error((j && j.message) || "خطا در دریافت لیست");
      setRows(Array.isArray(j) ? j : []);
    } catch (e: any) {
      setErr(e?.message || "خطا در دریافت لیست");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ---------- Edit ---------- */
  function openEdit(t: Term) {
    setEditTarget(t);
    setEditForm({ name: t.name || "", status: t.status || "فعال" });
    setMsg(null); setErr(null);
  }
  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setErr(null);
    try {
      const r = await fetch(`/api/academic-terms/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name?.trim() || undefined,
          status: editForm.status || undefined,
        }),
      });
      const txt = await r.text(); let j:any; try { j = JSON.parse(txt); } catch {}
      if (!r.ok) throw new Error(Array.isArray(j?.message) ? j.message.join("، ") : (j?.message || "خطا در ذخیره ویرایش"));
      setMsg("با موفقیت ذخیره شد");
      setEditTarget(null);
      load();
    } catch (e: any) {
      setErr(e?.message || "خطا در ذخیره ویرایش");
    }
  }

  /* ---------- Delete ---------- */
  function openDelete(t: Term) {
    setDeleteTarget(t);
    setMsg(null); setErr(null);
  }
  async function confirmDelete() {
    if (!deleteTarget) return;
    setErr(null);
    try {
      const r = await fetch(`/api/academic-terms/${deleteTarget.id}`, { method: "DELETE" });
      const txt = await r.text(); let j:any; try { j = JSON.parse(txt); } catch {}
      if (!r.ok) throw new Error(j?.message || "خطا در حذف");
      setMsg("با موفقیت حذف شد");
      setDeleteTarget(null);
      load();
    } catch (e: any) {
      setErr(e?.message || "خطا در حذف");
    }
  }

  const fmtDate = (s?: string | null) => {
    if (!s) return "—";
    try { return new Date(s).toLocaleDateString("fa-IR"); } catch { return s.substring(0,10); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5 md:p-7" dir="rtl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl md:text-2xl font-extrabold">لیست دوره‌های تحصیلی</h1>
        <Link href="/admin/academic-terms/new" className="px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-sm">
          افزودن دوره
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
          <div className="text-gray-500 text-sm">دوره‌ای ثبت نشده است.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500">
                <th className="text-right py-2 border-b">نام</th>
                <th className="text-right py-2 border-b">وضعیت</th>
                <th className="text-right py-2 border-b">تاریخ ایجاد</th>
                <th className="text-right py-2 border-b">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="py-2 border-b">{t.name}</td>
                  <td className="py-2 border-b">{t.status || "—"}</td>
                  <td className="py-2 border-b">{fmtDate(t.created_at)}</td>
                  <td className="py-2 border-b">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(t)} className="px-3 py-1 rounded-xl border hover:bg-gray-100">
                        ویرایش
                      </button>
                      <button onClick={() => openDelete(t)} className="px-3 py-1 rounded-xl border border-red-300 text-red-700 hover:bg-red-50">
                        حذف
                      </button>
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
          <div className="font-semibold mb-3">ویرایش دوره</div>
          <form onSubmit={saveEdit} className="grid md:grid-cols-2 gap-3">
            <div className="md:col-span-1">
              <label className="block text-sm mb-1">نام دوره</label>
              <input
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm mb-1">وضعیت</label>
              <select
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                value={editForm.status}
                onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" className="px-4 py-2 rounded-xl border" onClick={() => setEditTarget(null)}>
                انصراف
              </button>
              <button className="px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700">
                ذخیره
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <div className="font-semibold mb-2">حذف دوره</div>
          <p className="text-sm text-gray-600 mb-4">
            آیا از حذف <b>{deleteTarget.name}</b> مطمئن هستید؟ این عمل قابل بازگشت نیست.
          </p>
          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 rounded-xl border" onClick={() => setDeleteTarget(null)}>
              انصراف
            </button>
            <button className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700" onClick={confirmDelete}>
              تأیید حذف
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* -------------- UI bits -------------- */
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
