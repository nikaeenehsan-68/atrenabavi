// apps/web/src/app/admin/staff-roles/page.tsx
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Modal } from "@/components/Modal";

type User = { id: number; first_name: string; last_name: string; username?: string };
type Klass = { id: number; name: string; code?: string };
type Term = { id: number; name: string };
type RoleOpt = { id: number; key: string; name: string; needs_class?: boolean; needs_term?: boolean };
type Row = {
  id: number;
  user_id: number;
  role_id: number;
  class_id: number | null;
  academic_term_id: number | null;
  role_label?: string; // 👈 اضافه شد
  user?: User;
  klass?: Klass | null;
  academic_term?: Term | null;
};

export default function StaffRolesPage() {
  const [year, setYear] = useState<{ id: number; title: string } | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Klass[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [roles, setRoles] = useState<RoleOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [openNew, setOpenNew] = useState(false);
  const [target, setTarget] = useState<Row | null>(null);

  const [form, setForm] = useState({
    user_id: 0,
    role_id: 0,
    class_id: 0,
    academic_term_id: 0,
  });

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === form.role_id),
    [roles, form.role_id]
  );
  const needClass = !!selectedRole?.needs_class;
  const needTerm = !!selectedRole?.needs_term;

  // وقتی نقش عوض می‌شود، فیلدهای غیرلازم را پاک کن
  useEffect(() => {
    setForm((f) => ({
      ...f,
      class_id: needClass ? f.class_id : 0,
      academic_term_id: needTerm ? f.academic_term_id : 0,
    }));
  }, [needClass, needTerm]);

  const roleNameById = useCallback(
    (id: number) => roles.find((r) => r.id === id)?.name || String(id),
    [roles]
  );
  const roleFlagsById = useCallback(
    (id: number) => roles.find((r) => r.id === id) || ({} as RoleOpt),
    [roles]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    setMsg(null);
    try {
      const [listRes, metaRes] = await Promise.all([
        fetch("/api/staff-roles", { cache: "no-store" }),
        fetch("/api/staff-roles/meta", { cache: "no-store" }),
      ]);
      const listJ = await listRes.json().catch(() => ({}));
      const metaJ = await metaRes.json().catch(() => ({}));

      if (!listRes.ok) throw new Error(listJ?.message || "خطا در دریافت لیست نقش‌ها");
      if (!metaRes.ok) throw new Error(metaJ?.message || "خطا در دریافت اطلاعات کمکی");

      setYear(listJ?.year || metaJ?.year || null);
      setRows(Array.isArray(listJ?.rows) ? listJ.rows : []);
      setUsers(Array.isArray(metaJ?.users) ? metaJ.users : []);
      setClasses(Array.isArray(metaJ?.classes) ? metaJ.classes : []);
      setTerms(Array.isArray(metaJ?.terms) ? metaJ.terms : []);
      setRoles(Array.isArray(metaJ?.roles) ? metaJ.roles : []);
    } catch (e: any) {
      setErr(e?.message || "خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setForm({ user_id: 0, role_id: 0, class_id: 0, academic_term_id: 0 });
    setOpenNew(true);
    setErr(null);
    setMsg(null);
  }

  function openEdit(row: Row) {
    setTarget(row);
    setErr(null);
    setMsg(null);
    setForm({
      user_id: row.user_id,
      role_id: row.role_id,
      class_id: row.class_id || 0,
      academic_term_id: row.academic_term_id || 0,
    });
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!form.user_id || !form.role_id) return setErr("کاربر و نقش را انتخاب کنید");

    if (needClass && !form.class_id) return setErr("برای نقش معلم، انتخاب کلاس الزامی است");
    if (needTerm && !form.academic_term_id) return setErr("برای نقش معاون، انتخاب دوره الزامی است");

    try {
      const payload: any = {
        user_id: form.user_id,
        role_id: form.role_id,
      };
      if (needClass) payload.class_id = form.class_id;
      if (needTerm) payload.academic_term_id = form.academic_term_id;

      const r = await fetch("/api/staff-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const t = await r.text();
      let j: any;
      try {
        j = JSON.parse(t);
      } catch {}
      if (!r.ok) throw new Error(j?.message || "خطا در ایجاد نقش");

      setMsg("ثبت نقش با موفقیت انجام شد");
      setOpenNew(false);
      load();
    } catch (e: any) {
      setErr(e?.message || "خطا در ایجاد نقش");
    }
  }

  async function onUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!target) return;
    setErr(null);
    setMsg(null);

    // نقش نهایی که می‌خواهیم ذخیره کنیم
    const finalRoleId = form.role_id || target.role_id;
    const flags = roleFlagsById(finalRoleId);
    if (flags.needs_class && !form.class_id) return setErr("برای نقش معلم، انتخاب کلاس الزامی است");
    if (flags.needs_term && !form.academic_term_id) return setErr("برای نقش معاون، انتخاب دوره الزامی است");

    try {
      const patch: any = {};
      if (form.role_id) patch.role_id = finalRoleId;
      patch.class_id = flags.needs_class ? (form.class_id || undefined) : null;
      patch.academic_term_id = flags.needs_term ? (form.academic_term_id || undefined) : null;

      const r = await fetch(`/api/staff-roles/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const t = await r.text();
      let j: any;
      try {
        j = JSON.parse(t);
      } catch {}
      if (!r.ok) throw new Error(j?.message || "خطا در ویرایش نقش");

      setMsg("ویرایش با موفقیت انجام شد");
      setTarget(null);
      load();
    } catch (e: any) {
      setErr(e?.message || "خطا در ویرایش نقش");
    }
  }

  async function onDelete(id: number) {
    setErr(null);
    setMsg(null);
    try {
      const r = await fetch(`/api/staff-roles/${id}`, { method: "DELETE" });
      const t = await r.text();
      let j: any;
      try {
        j = JSON.parse(t);
      } catch {}
      if (!r.ok) throw new Error(j?.message || "خطا در حذف نقش");
      setMsg("حذف انجام شد");
      load();
    } catch (e: any) {
      setErr(e?.message || "خطا در حذف نقش");
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5 md:p-7" dir="rtl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl md:text-2xl font-extrabold">نقش همکاران</h1>
        <div className="flex items-center gap-3">
          {year && (
            <div className="text-sm text-gray-600">
              سال جاری: <b>{year.title}</b>
            </div>
          )}
          <button
            onClick={openCreate}
            className="px-3 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700"
          >
            افزودن نقش
          </button>
        </div>
      </div>

      {(msg || err) && (
        <div
          className={`mb-4 text-sm px-3 py-2 rounded-lg border ${
            err
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          {err || msg}
        </div>
      )}

      <div className="rounded-xl border bg-white p-4 overflow-x-auto">
        {loading ? (
          <div className="text-gray-500">در حال بارگذاری…</div>
        ) : rows.length === 0 ? (
          <div className="text-gray-500 text-sm">نقشی برای سال جاری ثبت نشده است.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500">
                <th className="text-right py-2 border-b">همکار</th>
                <th className="text-right py-2 border-b">نقش</th>
                <th className="text-right py-2 border-b">کلاس</th>
                <th className="text-right py-2 border-b">دوره تحصیلی</th>
                <th className="text-right py-2 border-b">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="py-2 border-b">
                    {r?.user?.first_name} {r?.user?.last_name}
                  </td>
                  <td className="py-2 border-b"> {r.role_label || roleNameById(r.role_id)} </td>
                  <td className="py-2 border-b">{r?.klass?.name || "—"}</td>
                  <td className="py-2 border-b">{r?.academic_term?.name || "—"}</td>
                  <td className="py-2 border-b">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(r)}
                        className="px-3 py-1 rounded border hover:bg-gray-100"
                      >
                        ویرایش
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("حذف این نقش؟")) onDelete(r.id);
                        }}
                        className="px-3 py-1 rounded border border-red-300 text-red-700 hover:bg-red-50"
                      >
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

      {/* Create */}
      <Modal open={openNew} onClose={() => setOpenNew(false)} title="افزودن نقش">
        <form onSubmit={onCreate} className="grid md:grid-cols-2 gap-3">
          <label className="block">
            <div className="mb-1 text-sm text-gray-600">همکار</div>
            <select
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
              value={form.user_id}
              onChange={(e) => setForm((f) => ({ ...f, user_id: Number(e.target.value) }))}
              required
            >
              <option value={0}>— انتخاب همکار —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.first_name} {u.last_name} {u.username ? `(${u.username})` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <div className="mb-1 text-sm text-gray-600">نقش</div>
            <select
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
              value={form.role_id}
              onChange={(e) => setForm((f) => ({ ...f, role_id: Number(e.target.value) }))}
              required
            >
              <option value={0}>— انتخاب نقش —</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>

          {needClass && (
            <label className="block">
              <div className="mb-1 text-sm text-gray-600">کلاس</div>
              <select
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                value={form.class_id}
                onChange={(e) => setForm((f) => ({ ...f, class_id: Number(e.target.value) }))}
                required
              >
                <option value={0}>— انتخاب کلاس —</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.code ? ` (${c.code})` : ""}
                  </option>
                ))}
              </select>
            </label>
          )}

          {needTerm && (
            <label className="block">
              <div className="mb-1 text-sm text-gray-600">دوره تحصیلی</div>
              <select
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                value={form.academic_term_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, academic_term_id: Number(e.target.value) }))
                }
                required
              >
                <option value={0}>— انتخاب دوره —</option>
                {terms.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded-xl border" onClick={() => setOpenNew(false)}>
              انصراف
            </button>
            <button className="px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700">
              ثبت نقش
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit */}
      <Modal open={!!target} onClose={() => setTarget(null)} title="ویرایش نقش">
        <form onSubmit={onUpdate} className="grid md:grid-cols-2 gap-3">
          <div className="md:col-span-2 text-sm text-gray-700">
            {target && (
              <>
                همکار: <b>{target?.user?.first_name} {target?.user?.last_name}</b>
              </>
            )}
          </div>

          <label className="block">
            <div className="mb-1 text-sm text-gray-600">نقش</div>
            <select
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
              value={form.role_id}
              onChange={(e) => setForm((f) => ({ ...f, role_id: Number(e.target.value) }))}
            >
              <option value={0}>— بدون تغییر —</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>

          {/* نقش نهایی برای UI شرطی در مودال ویرایش */}
          {(() => {
            const rid = form.role_id || target?.role_id || 0;
            const rf = roleFlagsById(rid);
            return (
              <>
                {rf.needs_class && (
                  <label className="block">
                    <div className="mb-1 text-sm text-gray-600">کلاس</div>
                    <select
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                      value={form.class_id}
                      onChange={(e) => setForm((f) => ({ ...f, class_id: Number(e.target.value) }))}
                      required
                    >
                      <option value={0}>— انتخاب کلاس —</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                          {c.code ? ` (${c.code})` : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {rf.needs_term && (
                  <label className="block">
                    <div className="mb-1 text-sm text-gray-600">دوره تحصیلی</div>
                    <select
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                      value={form.academic_term_id}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, academic_term_id: Number(e.target.value) }))
                      }
                      required
                    >
                      <option value={0}>— انتخاب دوره —</option>
                      {terms.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </>
            );
          })()}

          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded-xl border" onClick={() => setTarget(null)}>
              انصراف
            </button>
            <button className="px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700">
              ذخیره تغییرات
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
