"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/Modal";

type RoleName = "teacher" | "assistant" | "staff" | string;

type RoleDef = { id: number; name: RoleName; description?: string | null };
type Term = { id: number; name: string };
type GradeLevel = { id: number; name: string };
type UserRole = {
  id: number;
  role: RoleDef;                // { id, name }
  academic_term_id?: number | null;
  academic_year_id?: number | null;
  class_id?: number | null;
  grade_level_id?: number | null; // اگر در DB اضافه شود
};

type Row = {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  phone?: string | null;
  is_active: boolean;
  roles?: UserRole[]; // ← جدید: برای نمایش نقش‌ها در لیست
};

export default function UsersListPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<Row | null>(null);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", phone: "", is_active: true, password: "" });

  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);

  // --- جدید: مدیریت نقش‌ها ---
  const [rolesOpenFor, setRolesOpenFor] = useState<Row | null>(null);

  const load = useCallback(async () => {
  setLoading(true); 
  setErr(null);
  try {
    const res = await fetch("/api/users?with=roles", { cache: "no-store" });

    // --- Debug: خروجی خام را لاگ کن
    const txt = await res.text();
    console.log("RAW /api/users?with=roles →", txt);

    let data: any = null;
    try {
      data = JSON.parse(txt);
    } catch (e) {
      console.warn("JSON parse error:", e);
    }

    // --- Debug: داده‌ی پارس شده را هم ببین
    console.log("PARSED /api/users?with=roles →", data);

    setRows(Array.isArray(data) ? data : []);
  } catch (e: any) {
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
      const payload: any = {
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
      const txt = await r.text(); let j: any; try { j = JSON.parse(txt); } catch { }
      if (!r.ok) throw new Error(Array.isArray(j?.message) ? j.message.join("، ") : (j?.message || "خطا در ذخیره ویرایش"));
      setMsg("با موفقیت ذخیره شد");
      setEditTarget(null); load();
    } catch (e: any) {
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
      const txt = await r.text(); let j: any; try { j = JSON.parse(txt); } catch { }
      if (!r.ok) throw new Error(j?.message || "خطا در حذف");
      setMsg("با موفقیت حذف شد");
      setDeleteTarget(null); load();
    } catch (e: any) {
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
                <th className="text-right py-2 border-b">نقش‌ها</th>
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

                  {/* نمایش نقش‌ها */}
                  <td className="py-2 border-b">
                    <div className="flex flex-wrap gap-1">
                      {r.roles && r.roles.length > 0 ? (
                        r.roles.map(ur => (
                          <span key={ur.id} className="px-2 py-0.5 rounded-full border text-[12px]">
                            {faRole(ur.role?.name)}
                            {renderScope(ur)}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </div>
                  </td>

                  <td className="py-2 border-b">{r.is_active ? "فعال" : "غیرفعال"}</td>
                  <td className="py-2 border-b">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => openEdit(r)} className="px-3 py-1 rounded-xl border hover:bg-gray-100">ویرایش</button>
                      <button onClick={() => setRolesOpenFor(r)} className="px-3 py-1 rounded-xl border border-indigo-300 text-indigo-700 hover:bg-indigo-50">نقش‌ها</button>
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

      {/* Roles Modal */}
      <RolesModal
        open={!!rolesOpenFor}
        user={rolesOpenFor}
        onClose={() => setRolesOpenFor(null)}
        onSaved={() => { setRolesOpenFor(null); load(); }}
      />

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

// --- Utilities to render role/scopes ---
function faRole(name?: string) {
  if (!name) return "نقش";
  switch (name) {
    case "teacher": return "معلم";
    case "assistant": return "معاون";
    case "staff": return "کارمند";
    default: return name;
  }
}
function renderScope(ur: UserRole) {
  const bits: string[] = [];
  if (ur.academic_term_id) bits.push(`ترم ${ur.academic_term_id}`);
  if (ur.grade_level_id) bits.push(`پایه ${ur.grade_level_id}`);
  if (ur.class_id) bits.push(`کلاس ${ur.class_id}`);
  if (bits.length === 0) return null;
  return <span className="text-gray-500"> — {bits.join("، ")}</span>;
}

// ------------ Roles Modal ------------
function RolesModal({ open, user, onClose, onSaved }:{
  open: boolean; user: Row | null;
  onClose: ()=>void; onSaved: ()=>void;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [roleDefs, setRoleDefs] = useState<RoleDef[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [grades, setGrades] = useState<GradeLevel[]>([]);

  // آیتم‌هایی که قرار است اضافه کنیم (چندگانه)
  type NewItem = { role_id?: number; role_name?: RoleName; academic_term_id?: number | null; grade_level_id?: number | null };
  const [items, setItems] = useState<NewItem[]>([{ }]);

  // بارگذاری لیست‌های کمکی
  useEffect(() => {
    if (!open) return;
    setErr(null);
    (async () => {
      try {
        const [r1, r2, r3] = await Promise.all([
          fetch("/api/roles").then(r=>r.json()).catch(()=>[]),
          fetch("/api/academic-terms").then(r=>r.json()).catch(()=>[]),
          fetch("/api/grade-levels").then(r=>r.json()).catch(()=>[]),
        ]);
        setRoleDefs(Array.isArray(r1) ? r1 : []);
        setTerms(Array.isArray(r2) ? r2 : []);
        setGrades(Array.isArray(r3) ? r3 : []);
      } catch (e:any) {
        setErr(e?.message || "خطا در دریافت داده‌ها");
      }
    })();
  }, [open]);

  // اضافه کردن یک ردیف نقش جدید
  function addRow() { setItems(s => [...s, {}]); }
  function removeRow(i: number) { setItems(s => s.filter((_,idx)=>idx!==i)); }
  function setRow(i: number, patch: Partial<NewItem>) {
    setItems(s => s.map((it, idx) => idx===i ? { ...it, ...patch } : it));
  }

  // ذخیره نقش‌ها
  async function saveRoles(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setErr(null); setLoading(true);
    try {
      // پاکسازی/اعتبارسنجی ساده
      const payload = items
        .map(it => {
          const rd = roleDefs.find(r => r.id === it.role_id);
          const name = it.role_name || rd?.name;
          if (!rd && !it.role_id) return null;
          // منطق شرطی: اگر معاون → ترم لازم؛ اگر معلم → پایه لازم
          if (name === "assistant" && !it.academic_term_id) return null;
          if (name === "teacher" && !it.grade_level_id) return null;
          return {
            user_id: user.id,
            role_id: it.role_id || rd?.id,
            academic_term_id: it.academic_term_id ?? null,
            grade_level_id: it.grade_level_id ?? null,
            // اگر لازم شد می‌توان academic_year_id یا class_id هم فرستاد
          };
        })
        .filter(Boolean);

      if (payload.length === 0) throw new Error("اطلاعات نقش‌ها کامل نیست.");

      // یکجا ارسال (bulk). اگر بک‌اند bulk ندارد، اینجا می‌توان حلقه زد.
      const r = await fetch("/api/user-roles/bulk", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ items: payload }),
      });
      const t = await r.text(); let j:any; try{ j = JSON.parse(t);}catch{}
      if (!r.ok) throw new Error(Array.isArray(j?.message) ? j.message.join("، ") : (j?.message || "خطا در ذخیره نقش‌ها"));

      onSaved();
    } catch (e:any) {
      setErr(e?.message || "خطا در ذخیره نقش‌ها");
    } finally {
      setLoading(false);
    }
  }

  // حذف نقش موجود
  async function removeExistingRole(roleAssignmentId: number) {
    if (!user) return;
    try {
      const r = await fetch(`/api/user-roles/${roleAssignmentId}`, { method:"DELETE" });
      if (!r.ok) throw new Error("حذف نقش ناموفق بود");
      // رفرش از بیرون
      onSaved();
    } catch (e:any) {
      setErr(e?.message || "خطا در حذف نقش");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={user ? `نقش‌ها: ${user.first_name} ${user.last_name}` : "نقش‌ها"}>
      <div className="space-y-4">
        {/* نقش‌های فعلی کاربر */}
        <div className="border rounded-xl p-3">
          <div className="text-sm text-gray-600 mb-2">نقش‌های فعلی</div>
          <div className="flex flex-wrap gap-2">
            {user?.roles && user.roles.length > 0 ? user.roles.map(ur => (
              <span key={ur.id} className="inline-flex items-center gap-2 px-2 py-1 rounded-full border text-xs">
                {faRole(ur.role?.name)} {renderScope(ur)}
                <button onClick={()=>removeExistingRole(ur.id)} className="text-rose-600 hover:underline">حذف</button>
              </span>
            )) : <span className="text-xs text-gray-400">—</span>}
          </div>
        </div>

        {/* افزودن نقش‌های جدید */}
        <form onSubmit={saveRoles} className="space-y-3">
          <div className="text-sm text-gray-700">افزودن نقش جدید</div>

          {items.map((it, i) => {
            const rd = roleDefs.find(r => r.id === it.role_id);
            const roleName: RoleName | undefined = it.role_name || rd?.name;

            return (
              <div key={i} className="grid md:grid-cols-3 gap-3 border rounded-xl p-3">
                <Field label="نقش" required>
                  <select
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                    value={it.role_id || ""}
                    onChange={e=>setRow(i,{ role_id: e.target.value ? Number(e.target.value) : undefined, role_name: undefined })}
                  >
                    <option value="">— انتخاب نقش —</option>
                    {roleDefs.map(r => <option key={r.id} value={r.id}>{faRole(r.name)}</option>)}
                  </select>
                </Field>

                {/* اگر نقش «معاون» باشد → انتخاب ترم */}
                {roleName === "assistant" && (
                  <Field label="ترم (الزامی)" required>
                    <select
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      value={it.academic_term_id ?? ""}
                      onChange={e=>setRow(i,{ academic_term_id: e.target.value ? Number(e.target.value) : undefined })}
                    >
                      <option value="">— انتخاب ترم —</option>
                      {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </Field>
                )}

                {/* اگر نقش «معلم» باشد → انتخاب پایه */}
                {roleName === "teacher" && (
                  <Field label="پایه تحصیلی (الزامی)" required>
                    <select
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      value={it.grade_level_id ?? ""}
                      onChange={e=>setRow(i,{ grade_level_id: e.target.value ? Number(e.target.value) : undefined })}
                    >
                      <option value="">— انتخاب پایه —</option>
                      {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </Field>
                )}

                <div className="flex items-end">
                  <button type="button" onClick={()=>removeRow(i)} className="px-3 py-2 rounded-xl border text-rose-700 border-rose-300 hover:bg-rose-50">
                    حذف ردیف
                  </button>
                </div>
              </div>
            );
          })}

          <div className="flex justify-between">
            <button type="button" onClick={addRow} className="px-3 py-2 rounded-xl border">+ افزودن نقش دیگر</button>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border">انصراف</button>
              <button disabled={loading} className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
                {loading ? "در حال ذخیره…" : "ذخیره نقش‌ها"}
              </button>
            </div>
          </div>

          {err && <div className="text-rose-700 text-sm">{err}</div>}
        </form>
      </div>
    </Modal>
  );
}
