import { NextResponse } from 'next/server';

export default function proxy(req: { nextUrl: URL; url: string }) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
