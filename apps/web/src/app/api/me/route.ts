import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API = process.env.NEXT_PUBLIC_API_URL!;
const COOKIE = process.env.AUTH_COOKIE_NAME || 'atrenabavi_token';

export async function GET() {
  const c = await cookies();                         // نکته: در Next 14 async است
  const token = c.get(COOKIE)?.value;
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const r = await fetch(`${API}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
