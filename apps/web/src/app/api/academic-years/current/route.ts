import { NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_URL!; // مثل: http://localhost:3001

export async function GET() {
  const r = await fetch(`${API}/academic-years/current`, { cache: 'no-store' });
  const data = await r.json().catch(() => null);
  return NextResponse.json(data ?? null, { status: r.status });
}
