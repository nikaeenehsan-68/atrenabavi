import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API = process.env.NEXT_PUBLIC_API_URL!;
const COOKIE = process.env.AUTH_COOKIE_NAME || 'atrenabavi_token';

export async function GET() {
  const r = await fetch(`${API}/academic-years`, { cache: 'no-store' });
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}

export async function POST(req: Request) {
  const c = await cookies();
  const token = c.get(COOKIE)?.value;
  const body = await req.json();

  const r = await fetch(`${API}/academic-years`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
