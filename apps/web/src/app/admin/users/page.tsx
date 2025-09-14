"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/Modal";

type Row = {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  phone?: string | null;
  is_active: boolean;
};

export default function UsersListPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<Row | null>(null);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", phone: "", is_active: true, password: "" });

  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const list = await fetch("/api/users", { cache: "no-store" }).then(async r=>{const t=await r.text(); try{return JSON.parse(t)}catch{return []}});
      setRows(Array.isArray(list) ? list : []);
    } catch (e:any) {
      setErr(e?.message || "خطا در دریافت لیست");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openEdit(r: Row) {
    setEditTarget(r);
    setEditForm({ first_name: r.first_name || "", last_name: r.last_name || "", phone: r.phone || "", is_active: !!r.is_active, password: "" });
    setMsg(null); setErr(null);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setErr(null);
    try {
      const payload:any = {
        first_name: editForm.first_name.trim(),
        last_name: editForm.last_name.trim(),
        phone: editForm.phone || null,
        is_active: !!editForm.is_active,
      };
      if (editForm.password && editForm.password.length >= 6) payload.password = editForm.password;

      const r = await fetch(`/api/users/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const txt = await r.text(); let j:any; try{ j=JSON.parse(txt);}catch{}
      if (!r.ok) throw new Error(Array.isArray(j?.message) ? j.message.join("، ") : (j?.message || "خطا در ذخیره ویرایش"));
      setMsg("با موفقیت ذخیره شد");
      setEditTarget(null); load();
    } catch (e:any) {
      setErr(e?.message || "خطا در ذخیره ویرایش");
    }
  }

  function openDelete(r: Row) {
    setDeleteTarget(r); setMsg(null); setErr(null);
  }
  async function confirmDelete() {
    if (!deleteTarget) return;
    setErr(null);
    try {
      const r = await fetch(`/api/users/${deleteTarget.id}`, { method: "DELETE" });
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
        <h1 className="text-xl md:text-2xl font-extrabold">لیست همکاران</h1>
        <Link href="/admin/users/new" className="px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-sm">
          افزودن همکار
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
          <div className="text-gray-500 text-sm">همکاری ثبت نشده است.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500">
                <th className="text-right py-2 border-b">نام</th>
                <th className="text-right py-2 border-b">نام خانوادگی</th>
                <th className="text-right py-2 border-b">نام کاربری</th>
                <th className="text-right py-2 border-b">تلفن</th>
                <th className="text-right py-2 border-b">وضعیت</th>
                <th className="text-right py-2 border-b">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="py-2 border-b">{r.first_name}</td>
                  <td className="py-2 border-b">{r.last_name}</td>
                  <td className="py-2 border-b">{r.username}</td>
                  <td className="py-2 border-b">{r.phone || "—"}</td>
                  <td className="py-2 border-b">{r.is_active ? "فعال" : "غیرفعال"}</td>
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
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="ویرایش همکار">
        <form onSubmit={saveEdit} className="grid md:grid-cols-2 gap-3">
          <Field label="نام" required><Input value={editForm.first_name} onChange={(e)=>setEditForm(f=>({...f, first_name: e.target.value}))} /></Field>
          <Field label="نام خانوادگی" required><Input value={editForm.last_name} onChange={(e)=>setEditForm(f=>({...f, last_name: e.target.value}))} /></Field>
          <Field label="تلفن"><Input value={editForm.phone} onChange={(e)=>setEditForm(f=>({...f, phone: e.target.value}))} dir="ltr" /></Field>
          <Field label="رمز عبور جدید (اختیاری)"><Input type="password" value={editForm.password} onChange={(e)=>setEditForm(f=>({...f, password: e.target.value}))} dir="ltr" /></Field>
          <label className="flex items-center gap-2 md:col-span-2">
            <input type="checkbox" checked={editForm.is_active} onChange={(e)=>setEditForm(f=>({...f, is_active: e.target.checked}))} />
            <span className="text-sm text-gray-700">فعال</span>
          </label>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded-xl border" onClick={() => setEditTarget(null)}>انصراف</button>
            <button className="px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700">ذخیره</button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="حذف همکار">
        <p className="text-sm text-gray-600 mb-4">
          آیا از حذف <b>{deleteTarget?.first_name} {deleteTarget?.last_name}</b> مطمئن هستید؟ این عمل قابل بازگشت نیست.
        </p>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded-xl border" onClick={() => setDeleteTarget(null)}>انصراف</button>
          <button className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700" onClick={confirmDelete}>تأیید حذف</button>
        </div>
      </Modal>
    </div>
  );
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
  return <input {...props} className={`inp w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 ${props.className || ""}`} />;
}
