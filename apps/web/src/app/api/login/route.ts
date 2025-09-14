import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await r.json();
  if (!r.ok) {
    return NextResponse.json(data, { status: r.status });
  }

  const res = NextResponse.json({ user: data.user });
  const cookieName = process.env.AUTH_COOKIE_NAME || 'atrenabavi_token';

  // ست‌کردن توکن در کوکی HttpOnly
  res.cookies.set(cookieName, data.access_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // روی تولید true کن
    path: '/',
    maxAge: 60 * 60 * 24, // 1 روز
  });

  return res;
}
