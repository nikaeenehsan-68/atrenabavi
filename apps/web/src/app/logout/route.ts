import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const cookieName = process.env.AUTH_COOKIE_NAME || 'atrenabavi_token';
  res.cookies.set(cookieName, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
