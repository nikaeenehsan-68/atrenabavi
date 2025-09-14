import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API = process.env.NEXT_PUBLIC_API_URL!;
const COOKIE = process.env.AUTH_COOKIE_NAME || 'atrenabavi_token';

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  const c = await cookies();
  const token = c.get(COOKIE)?.value;

  const r = await fetch(`${API}/academic-years/${params.id}/current`, {
    method: 'PATCH',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
