// apps/web/src/app/api/auth/verify-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSessionToken } from '@/lib/session-token';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const user = await getUserFromSessionToken(token);

    if (!user || !user.isActive) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      user: { id: user.id, email: user.email },
    });
  } catch {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
