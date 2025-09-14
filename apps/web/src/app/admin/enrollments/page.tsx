"use client";

import { useEffect, useState, useCallback } from "react";
import { Modal } from "@/components/Modal";

type Student = { id: number; first_name: string; last_name: string };
type Klass = { id: number; name: string; code?: string };
type Meta = { year: { id: number; title: string }, classes: Klass[], statuses: {value:string,label:string}[] };

export default function EnrollmentsPage() {
  const [year, setYear] = useState<{id:number; title:string} | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Klass[]>([]);
  const [statuses, setStatuses] = useState<{value:string,label:string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [target, setTarget] = useState<Student | null>(null);
  const [form, setForm] = useState({ class_id: 0, status: "active" });

  const load = useCallback(async () => {
  setLoading(true); setErr(null);
  try {
    const [uRes, mRes] = await Promise.all([
      fetch("/api/enrollments/unenrolled", { cache: "no-store" }),
      fetch("/api/enrollments/meta", { cache: "no-store" }),
    ]);

    const u = await uRes.json().catch(() => ({}));
    const m = await mRes.json().catch(() => ({}));

    if (!uRes.ok) throw new Error(u?.message || "خطا در دریافت لیست دانش‌آموزان ثبت‌نام‌نشده");
    if (!mRes.ok) throw new Error(m?.message || "خطا در دریافت اطلاعات کمکی");

    setYear(u?.year || m?.year || null);
    setStudents(Array.isArray(u?.students) ? u.students : []);
    setClasses(Array.isArray(m?.classes) ? m.classes : []);
    setStatuses(Array.isArray(m?.statuses) ? m.statuses : []);
  } catch (e:any) {
    setErr(e?.message || "خطا در دریافت اطلاعات");
  } finally {
    setLoading(false);
  }
}, []);


  useEffect(()=>{ load(); }, [load]);

  function openEnroll(stu: Student) {
    setTarget(stu);
    setForm({ class_id: 0, status: "active" });
    setMsg(null); setErr(null);
  }

  async function confirmEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!target) return;
    if (!form.class_id) return setErr("کلاس را انتخاب کنید");
    setErr(null);
    try {
      const r = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: target.id, class_id: form.class_id, status: form.status }),
      });
      const t = await r.text(); let j:any; try{ j=JSON.parse(t);}catch{}
      if (!r.ok) throw new Error(j?.message || "خطا در ثبت نام");
      setMsg("ثبت‌نام با موفقیت انجام شد");
      setTarget(null);
      setStudents((list)=>list.filter(x=>x.id!==target.id));
    } catch (e:any) {
      setErr(e?.message || "خطا در ثبت نام");
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5 md:p-7" dir="rtl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl md:text-2xl font-extrabold">ثبت‌نام دانش‌آموزان</h1>
        {year && <div className="text-sm text-gray-600">سال تحصیلی جاری: <b>{year.title}</b></div>}
      </div>

      {(msg || err) && (
        <div className={`mb-4 text-sm px-3 py-2 rounded-lg border ${err ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}>
          {err || msg}
        </div>
      )}

      <div className="rounded-xl border bg-white p-4 overflow-x-auto">
        {loading ? (
          <div className="text-gray-500">در حال بارگذاری…</div>
        ) : students.length === 0 ? (
          <div className="text-gray-500 text-sm">همه‌ی دانش‌آموزان در سال جاری ثبت‌نام شده‌اند.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500">
                <th className="text-right py-2 border-b">نام</th>
                <th className="text-right py-2 border-b">نام خانوادگی</th>
                <th className="text-right py-2 border-b">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="py-2 border-b">{s.first_name}</td>
                  <td className="py-2 border-b">{s.last_name}</td>
                  <td className="py-2 border-b">
                    <button onClick={() => openEnroll(s)} className="px-3 py-1 rounded-xl bg-teal-600 text-white hover:bg-teal-700">ثبت‌نام</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={!!target} onClose={()=>setTarget(null)} title={target ? `ثبت‌نام: ${target.first_name} ${target.last_name}` : "ثبت‌نام"}>
        <form onSubmit={confirmEnroll} className="grid md:grid-cols-2 gap-3">
          <label className="block">
            <div className="mb-1 text-sm text-gray-600">کلاس</div>
            <select
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
              value={form.class_id}
              onChange={(e)=>setForm(f=>({...f, class_id: Number(e.target.value)}))}
            >
              <option value={0}>— انتخاب کلاس —</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}{c.code ? ` (${c.code})` : ""}</option>)}
            </select>
          </label>

          <label className="block">
            <div className="mb-1 text-sm text-gray-600">وضعیت</div>
            <select
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
              value={form.status}
              onChange={(e)=>setForm(f=>({...f, status: e.target.value}))}
            >
              <option value="active">فعال</option>
              <option value="deferred">معوق</option>
              <option value="expelled">اخراج</option>
              <option value="graduated">فارغ‌التحصیل</option>
            </select>
          </label>

          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded-xl border" onClick={()=>setTarget(null)}>انصراف</button>
            <button className="px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700">تأیید ثبت‌نام</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
