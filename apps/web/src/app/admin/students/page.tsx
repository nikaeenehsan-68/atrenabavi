"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

/* ---------- Types ---------- */
type Student = {
  id: number;
  first_name: string;
  last_name: string;
  grade_title?: string | null;
};

type Klass = {
  id: number;
  name: string;
  code?: string | null;
  academic_year_id: number;
};

type AcademicYear = {
  id: number;
  title?: string;
  is_current?: 0 | 1;
};

type Enrollment = {
  id: number;
  student_id: number;
  academic_year_id: number;
  class_id: number | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
};

type Group = {
  key: string;
  classId: number;
  name: string;
  code?: string | null;
  students: Student[];
};

/* ---------- Helpers ---------- */
const toNum = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : NaN);

const normalizeStudent = (s: any): Student => ({
  id: toNum(s.id),
  first_name: s.first_name ?? "",
  last_name: s.last_name ?? "",
  grade_title: s.grade_title ?? null,
});

const normalizeClass = (k: any): Klass => ({
  id: toNum(k.id),
  name: k.name ?? `کلاس #${k.id}`,
  code: k.code ?? null,
  academic_year_id: toNum(k.academic_year_id),
});

const normalizeEnrollment = (e: any): Enrollment => ({
  id: toNum(e.id),
  student_id: toNum(e.student_id),
  academic_year_id: toNum(e.academic_year_id),
  class_id: e.class_id == null ? null : toNum(e.class_id),
  status: e.status ?? null,
  created_at: e.created_at ?? null,
  updated_at: e.updated_at ?? null,
  deleted_at: e.deleted_at ?? null,
});

export default function StudentsListPage() {
  const [year, setYear] = useState<AcademicYear | null>(null);
  const [classes, setClasses] = useState<Klass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Edit modal state (فقط کلاس)
  const [editTarget, setEditTarget] = useState<Student | null>(null);
  const [editClassId, setEditClassId] = useState<number | null>(null);

  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());

  /* ---------- Load all ---------- */
  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      // سال جاری
      const ry = await fetch("/api/academic-years/current", { cache: "no-store" });
      const jy = await ry.json().catch(() => ({}));
      if (!ry.ok || !jy?.id) throw new Error(jy?.message || "سال تحصیلی جاری یافت نشد");
      setYear(jy);

      // کلاس‌های همین سال
      let rc = await fetch(`/api/classes?academic_year_id=${encodeURIComponent(jy.id)}`, { cache: "no-store" });
      let jc = await rc.json().catch(() => []);
      if (!rc.ok) {
        rc = await fetch("/api/classes", { cache: "no-store" });
        jc = await rc.json().catch(() => []);
        if (!rc.ok) throw new Error(jc?.message || "خطا در دریافت کلاس‌ها");
        jc = Array.isArray(jc) ? jc.filter((k: any) => Number(k.academic_year_id) === Number(jy.id)) : [];
      }
      setClasses((Array.isArray(jc) ? jc : []).map(normalizeClass));

      // ثبت‌نام‌های همین سال
      const re = await fetch(`/api/student-enrollments?academic_year_id=${encodeURIComponent(jy.id)}`, { cache: "no-store" });
      const jeAll = await re.json().catch(() => []);
      if (!re.ok) throw new Error(jeAll?.message || "خطا در دریافت ثبت‌نام‌ها");
      setEnrollments(
        (Array.isArray(jeAll) ? jeAll : [])
          .map(normalizeEnrollment)
          .filter((e) => e.academic_year_id === toNum(jy.id))
      );

      // دانش‌آموزان
      const rs = await fetch("/api/students", { cache: "no-store" });
      const js = await rs.json().catch(() => []);
      if (!rs.ok) throw new Error(js?.message || "خطا در دریافت دانش‌آموزان");
      setStudents((Array.isArray(js) ? js : []).map(normalizeStudent));

      setOpenKeys(new Set());
    } catch (e: any) {
      setErr(e?.message || "خطای نامشخص در دریافت داده‌ها");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ---------- Helpers ---------- */
  const getCurrentEnrollment = (studentId: number): Enrollment | undefined => {
    let best: Enrollment | undefined;
    for (const e of enrollments) {
      if (e.student_id !== studentId) continue;
      if (!best || Number(e.id) > Number(best.id)) best = e;
    }
    return best;
  };

  /* ---------- Grouping ---------- */
  const { groups, unassigned } = useMemo(() => {
    const classMap = new Map<number, Klass>();
    for (const k of classes) classMap.set(k.id, k);

    const byKey = new Map<string, Group>();
    for (const k of classes) {
      const key = `class:${k.id}`;
      byKey.set(key, { key, classId: k.id, name: k.name, code: k.code ?? null, students: [] });
    }

    const lastEnrollmentByStudent = new Map<number, Enrollment>();
    for (const e of enrollments) {
      if (e.class_id == null) continue;
      const prev = lastEnrollmentByStudent.get(e.student_id);
      if (!prev || Number(e.id) > Number(prev.id)) lastEnrollmentByStudent.set(e.student_id, e);

      // fallback group if this class id not in classes
      const key = `class:${e.class_id}`;
      if (!byKey.has(key)) {
        const k = classMap.get(e.class_id);
        byKey.set(key, { key, classId: e.class_id, name: k?.name ?? `کلاس #${e.class_id}`, code: k?.code ?? null, students: [] });
      }
    }

    const unassignedLocal: Student[] = [];
    for (const s of students) {
      const en = lastEnrollmentByStudent.get(s.id);
      if (!en || en.class_id == null) {
        unassignedLocal.push(s);
        continue;
      }
      const g = byKey.get(`class:${en.class_id}`);
      (g ? g.students : unassignedLocal).push(s);
    }

    const list = Array.from(byKey.values());
    list.sort((a, b) => {
      const pa = parseCode(a.code ?? "");
      const pb = parseCode(b.code ?? "");
      if (pa.num !== pb.num) return pa.num - pb.num;
      return pa.suf.localeCompare(pb.suf, "fa");
    });

    return { groups: list, unassigned: unassignedLocal };
  }, [classes, students, enrollments]);

  function parseCode(code: string) {
    const m = code?.trim().match(/^(\d+)\s*([A-Za-zآ-ی]+)?/);
    if (!m) return { num: Number.MAX_SAFE_INTEGER, suf: code || "" };
    return { num: parseInt(m[1] || "0", 10), suf: (m[2] || "").trim() };
  }

  /* ---------- Edit (change class only) ---------- */
  function openEdit(s: Student) {
    const en = getCurrentEnrollment(s.id);
    setEditTarget(s);
    setEditClassId(en?.class_id ?? null);
    setMsg(null);
    setErr(null);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget || !year) return;

    try {
      // تنها عملیات پشتیبانی‌شده: تغییر کلاس سال جاری
      const r = await fetch(`/api/student-enrollments/upsert`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: editTarget.id,
          academic_year_id: year.id,
          class_id: editClassId, // می‌تواند null برای «بدون کلاس» باشد
       
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.message || "خطا در به‌روزرسانی کلاس");

      setMsg("کلاسِ سال جاری با موفقیت به‌روزرسانی شد");
      setEditTarget(null);
      await load();
    } catch (e: any) {
      setErr(e?.message || "خطا در ذخیره");
    }
  }

  /* ---------- Delete (remove enrollment) ---------- */
  async function deleteEnrollment(s: Student) {
    try {
      const en = getCurrentEnrollment(s.id);
      if (!en?.id) {
        setMsg("برای این دانش‌آموز در سال جاری ثبت‌نامی وجود ندارد.");
        return;
      }
      const r = await fetch(`/api/student-enrollments/${en.id}`, { method: "DELETE" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.message || "خطا در حذف ثبت‌نام");

      setMsg("ثبت‌نام حذف شد");
      await load();
    } catch (e: any) {
      setErr(e?.message || "خطا در حذف ثبت‌نام");
    }
  }

  /* ---------- Accordion ---------- */
  const toggleKey = (k: string) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5 md:p-7" dir="rtl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl md:text-2xl font-extrabold">
          دانش‌آموزان بر اساس کلاس{" "}
          {year?.title && <span className="text-base font-normal text-gray-500">({year.title})</span>}
        </h1>
        <Link href="/admin/students/new" className="px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-sm">
          افزودن دانش‌آموز
        </Link>
      </div>

      {(msg || err) && (
        <div className={`mb-4 text-sm px-3 py-2 rounded-lg border ${err ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}>
          {err || msg}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border bg-white p-4 text-gray-500">در حال بارگذاری…</div>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => {
            const isOpen = openKeys.has(g.key);
            return (
              <div key={g.key} className="rounded-xl border">
                <button onClick={() => toggleKey(g.key)} className="w-full flex items-center justify-between px-4 py-3 text-right">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold">{g.name}</span>
                    {g.code && <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 border">{g.code}</span>}
                    <span className="text-xs text-gray-500">({g.students.length} نفر)</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                <div className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    {g.students.length === 0 ? (
                      <div className="px-4 pb-4 text-sm text-gray-500">دانش‌آموزی برای این کلاس ثبت نشده.</div>
                    ) : (
                      <div className="px-4 pb-4 overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-gray-500">
                              <th className="text-right py-2 border-b">نام</th>
                              <th className="text-right py-2 border-b">نام خانوادگی</th>
                              <th className="text-right py-2 border-b">پایه تحصیلی</th>
                              <th className="text-right py-2 border-b">عملیات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {g.students.map((s) => (
                              <tr key={s.id} className="hover:bg-gray-50">
                                <td className="py-2 border-b">{s.first_name}</td>
                                <td className="py-2 border-b">{s.last_name}</td>
                                <td className="py-2 border-b">{s.grade_title || "—"}</td>
                                <td className="py-2 border-b">
                                  <div className="flex gap-2">
                                    <button onClick={() => openEdit(s)} className="px-3 py-1 rounded-xl border hover:bg-gray-100">تغییر کلاس</button>
                                    <button onClick={() => deleteEnrollment(s)} className="px-3 py-1 rounded-xl border border-red-300 text-red-700 hover:bg-red-50">حذف ثبت‌نام</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* بدون کلاس */}
          <div className="rounded-xl border">
            <button onClick={() => toggleKey("unassigned")} className="w-full flex items-center justify-between px-4 py-3 text-right">
              <div className="flex items-center gap-3">
                <span className="text-base font-bold">دانش‌آموزان بدون کلاس (سال جاری)</span>
                <span className="text-xs text-gray-500">({unassigned.length} نفر)</span>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${openKeys.has("unassigned") ? "rotate-180" : ""}`} />
            </button>
            <div className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${openKeys.has("unassigned") ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                {unassigned.length === 0 ? (
                  <div className="px-4 pb-4 text-sm text-gray-500">همه‌ی دانش‌آموزان در سال جاری در کلاس‌ها ثبت شده‌اند.</div>
                ) : (
                  <div className="px-4 pb-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-500">
                          <th className="text-right py-2 border-b">نام</th>
                          <th className="text-right py-2 border-b">نام خانوادگی</th>
                          <th className="text-right py-2 border-b">پایه تحصیلی</th>
                          <th className="text-right py-2 border-b">عملیات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unassigned.map((s) => (
                          <tr key={s.id} className="hover:bg-gray-50">
                            <td className="py-2 border-b">{s.first_name}</td>
                            <td className="py-2 border-b">{s.last_name}</td>
                            <td className="py-2 border-b">{s.grade_title || "—"}</td>
                            <td className="py-2 border-b">
                              <div className="flex gap-2">
                                <button onClick={() => openEdit(s)} className="px-3 py-1 rounded-xl border hover:bg-gray-100">ثبت‌نام/انتخاب کلاس</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal: انتخاب کلاس سال جاری */}
      {editTarget && (
        <Modal onClose={() => setEditTarget(null)}>
          <div className="font-semibold mb-3">انتخاب / تغییر کلاس (سال جاری)</div>
          <form onSubmit={saveEdit} className="grid gap-3">
            <div className="text-sm text-gray-600">
              {editTarget.first_name} {editTarget.last_name}
            </div>
            <div>
              <label className="block text-sm mb-1">کلاس</label>
              <select
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                value={editClassId ?? ""}
                onChange={(e) => setEditClassId(e.target.value === "" ? null : Number(e.target.value))}
              >
                <option value="">— بدون کلاس —</option>
                {classes.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name} {k.code ? `(${k.code})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="px-4 py-2 rounded-xl border" onClick={() => setEditTarget(null)}>
                انصراف
              </button>
              <button className="px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700">ذخیره</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ---------------- UI bits ---------------- */
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-4">{children}</div>
      </div>
    </div>
  );
}
