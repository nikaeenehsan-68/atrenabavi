'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const r = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const j = await r.json().catch(()=>({message:'خطا'}));
    if (!r.ok) { setErr(j.message || 'خطا در ورود'); return; }
    router.push('/admin');
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border p-6 rounded-xl">
        <h1 className="text-xl font-bold text-center">ورود مدیر</h1>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <div>
          <label className="block mb-1">نام کاربری</label>
          <input className="w-full border rounded px-3 py-2" value={username} onChange={e=>setU(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1">رمز عبور</label>
          <input className="w-full border rounded px-3 py-2" type="password" value={password} onChange={e=>setP(e.target.value)} />
        </div>
        <button className="w-full rounded px-3 py-2 bg-black text-white">ورود</button>
      </form>
    </main>
  );
}
