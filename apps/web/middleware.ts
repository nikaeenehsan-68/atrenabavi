import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
export function middleware(req: NextRequest) {
  const name = process.env.AUTH_COOKIE_NAME || 'atrenabavi_token';
  const token = req.cookies.get(name)?.value;
  if (req.nextUrl.pathname.startsWith('/admin') && !token) {
    return NextResponse.redirect(new URL('/auth/sign-in', req.url));
  }
  return NextResponse.next();
}
export const config = { matcher: ['/admin/:path*'] };
