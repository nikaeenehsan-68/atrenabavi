"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import DateField from "@/components/DateField";
import { toJalali, fromJalali, isGregorian, normalizeDigits } from "@/lib/date";

type Year = {
  id: number;
  title: string;
  start_date?: string | null; // میلادی (DB)
  end_date?: string | null; // میلادی (DB)
  is_current: 0 | 1;
};

export default function SettingsPage() {
  // --- state ---
  const [years, setYears] = useState<Year[]>([]);
  const [current, setCurrent] = useState<Year | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState({ title: "", start_date: "", end_date: "" });

  const [editTarget, setEditTarget] = useState<Year | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Year | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    start_date: "", // جلالی برای ورودی
    end_date: "", // جلالی برای ورودی
  });

  // --- load data ---
  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [list, cur] = await Promise.all([
        fetch("/api/academic-years", { cache: "no-store" }).then((r) =>
          r.json()
        ),
        fetch("/api/academic-years/current", { cache: "no-store" }).then((r) =>
          r.json()
        ),
      ]);
      setYears(Array.isArray(list) ? list : []);
      setCurrent(cur ?? null);
    } catch (e: any) {
      setErr(e?.message || "خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // --- create ---
  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    // 👇 لاگ ورودی
    const payload = {
      title: form.title,
      start_date: form.start_date
        ? isGregorian(form.start_date)
          ? normalizeDigits(form.start_date)
          : fromJalali(form.start_date)
        : undefined,
      end_date: form.end_date
        ? isGregorian(form.end_date)
          ? normalizeDigits(form.end_date)
          : fromJalali(form.end_date)
        : undefined,
    };

    console.log("📤 Sending payload:", payload); // 👈 اینجا لاگ می‌گیری

    const r = await fetch("/api/academic-years", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const j = await r.json().catch(() => ({}));
    console.log("📥 Server response:", j); // 👈 لاگ پاسخ سرور

    if (!r.ok) return setErr(j.message || "خطا در ایجاد سال");

    setForm({ title: "", start_date: "", end_date: "" });
    load();
  }

  // --- set current ---
  async function setAsCurrent(id: number) {
    setErr(null);
    const r = await fetch(`/api/academic-years/${id}/current`, {
      method: "PATCH",
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      return setErr(j.message || "خطا در تنظیم سال جاری");
    }
    load();
  }

  // --- edit ---
  function openEdit(y: Year) {
    setEditTarget(y);
    setEditForm({
      title: y.title ?? "",
      start_date: toJalali(y.start_date),
      end_date: toJalali(y.end_date),
    });
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setErr(null);

    const r = await fetch(`/api/academic-years/${editTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editForm.title,
        start_date: editForm.start_date
          ? isGregorian(editForm.start_date)
            ? normalizeDigits(editForm.start_date)
            : fromJalali(editForm.start_date)
          : null,
        end_date: editForm.end_date
          ? isGregorian(editForm.end_date)
            ? normalizeDigits(editForm.end_date)
            : fromJalali(editForm.end_date)
          : null,
      }),
    });

    const j = await r.json().catch(() => ({}));
    if (!r.ok) return setErr(j.message || "خطا در ذخیره ویرایش");

    setEditTarget(null);
    load();
  }

  // --- delete ---
  async function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.is_current) {
      setErr("سال جاری قابل حذف نیست");
      return;
    }
    setErr(null);
    const r = await fetch(`/api/academic-years/${deleteTarget.id}`, {
      method: "DELETE",
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return setErr(j.message || "خطا در حذف سال");
    setDeleteTarget(null);
    load();
  }

  const currentId = useMemo(() => current?.id ?? 0, [current]);

  // --- UI ---
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">تنظیمات سال تحصیلی</h1>

      {/* انتخاب سال جاری */}
      <section className="rounded-xl border bg-white p-4 space-y-3">
        <div className="font-medium">سالِ جاری</div>
        {loading ? (
          <div>در حال بارگذاری…</div>
        ) : (
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <select
              className="border rounded px-3 py-2"
              value={currentId || ""}
              onChange={(e) => {
                const id = Number(e.target.value);
                if (id) setAsCurrent(id);
              }}
            >
              <option value="">— انتخاب کنید —</option>
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.title} {y.is_current ? "· جاری" : ""}
                </option>
              ))}
            </select>

            {current ? (
              <div className="text-sm text-gray-600">
                فعال: <b>{current.title}</b> (از {toJalali(current.start_date)}{" "}
                تا {toJalali(current.end_date)})
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                هیچ سال فعالی تنظیم نشده است.
              </div>
            )}
          </div>
        )}
      </section>

      {/* فهرست سال‌ها */}
      <section className="rounded-xl border bg-white p-4 space-y-3">
        <div className="font-medium">فهرست سال‌های تحصیلی</div>

        {loading ? (
          <div>در حال بارگذاری…</div>
        ) : years.length === 0 ? (
          <div className="text-gray-500 text-sm">سال تعریف نشده است.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500">
                  <th className="text-right py-2 border-b">عنوان</th>
                  <th className="text-right py-2 border-b">شروع</th>
                  <th className="text-right py-2 border-b">پایان</th>
                  <th className="text-right py-2 border-b">وضعیت</th>
                  <th className="text-right py-2 border-b">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {years.map((y) => (
                  <tr key={y.id} className="hover:bg-gray-50">
                    <td className="py-2 border-b">{y.title}</td>
                    <td className="py-2 border-b">{toJalali(y.start_date)}</td>
                    <td className="py-2 border-b">{toJalali(y.end_date)}</td>
                    <td className="py-2 border-b">
                      {y.is_current ? "جاری" : "—"}
                    </td>
                    <td className="py-2 border-b">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(y)}
                          className="px-3 py-1 rounded border hover:bg-gray-100"
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={() => setDeleteTarget(y)}
                          className="px-3 py-1 rounded border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
                          disabled={!!y.is_current}
                          title={y.is_current ? "سال جاری قابل حذف نیست" : ""}
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* مودال ویرایش */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-4 space-y-3">
            <div className="font-semibold">ویرایش سال تحصیلی</div>
            <form onSubmit={saveEdit} className="grid md:grid-cols-4 gap-3">
              <div className="md:col-span-4">
                <label className="block text-sm mb-1">عنوان سال</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  required
                />
              </div>
              <DateField
                label="تاریخ شروع (جلالی)"
                value={editForm.start_date}
                onChange={(val) =>
                  setEditForm({ ...editForm, start_date: val })
                }
              />
              <DateField
                label="تاریخ پایان (جلالی)"
                value={editForm.end_date}
                onChange={(val) => setEditForm({ ...editForm, end_date: val })}
              />
              <div className="md:col-span-4 flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded border"
                  onClick={() => setEditTarget(null)}
                >
                  انصراف
                </button>
                <button className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700">
                  ذخیره تغییرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال حذف */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-4 space-y-3">
            <div className="font-semibold">حذف سال تحصیلی</div>
            <p className="text-sm text-gray-600">
              آیا از حذف <b>{deleteTarget.title}</b> مطمئن هستید؟ این عمل قابل
              بازگشت نیست.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded border"
                onClick={() => setDeleteTarget(null)}
              >
                انصراف
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={confirmDelete}
                disabled={!!deleteTarget.is_current}
                title={deleteTarget.is_current ? "سال جاری قابل حذف نیست" : ""}
              >
                تأیید حذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ایجاد سال جدید */}
      <section className="rounded-xl border bg-white p-4 space-y-3">
        <div className="font-medium">افزودن سال جدید</div>
        <form onSubmit={onCreate} className="grid md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">عنوان سال</label>
            <input
              className="w-full border rounded px-3 py-2"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="مثلاً 1404-1405"
            />
          </div>

          <DateField
            label="تاریخ شروع (جلالی)"
            value={form.start_date}
            onChange={(val) => setForm({ ...form, start_date: val })}
            placeholder="مثلاً 1404/07/01"
          />

          <DateField
            label="تاریخ پایان (جلالی)"
            value={form.end_date}
            onChange={(val) => setForm({ ...form, end_date: val })}
            placeholder="مثلاً 1405/03/31"
          />

          <div className="md:col-span-4">
            <button className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 transition">
              ایجاد سال
            </button>
          </div>
        </form>
      </section>

      {err && <p className="text-red-600">{err}</p>}
    </div>
  );
}
