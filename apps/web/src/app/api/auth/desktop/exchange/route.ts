import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '../../../../../db';
import { users } from '../../../../../db/schema';
import { createDesktopSession, verifyDesktopAuthCode } from '@/lib/desktop-auth';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Missing auth code' }, { status: 400 });
    }

    const payload = verifyDesktopAuthCode(code);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired auth code' }, { status: 401 });
    }

    const [user] = await db
      .select({ id: users.id, email: users.email, isActive: users.isActive })
      .from(users)
      .where(eq(users.id, payload.userId));

    if (!user || !user.isActive || user.email !== payload.email) {
      return NextResponse.json({ error: 'User not authorized' }, { status: 401 });
    }

    const sessionToken = await createDesktopSession(user.id);

    return NextResponse.json({
      valid: true,
      token: sessionToken,
      user: { id: user.id, email: user.email },
    });
  } catch {
    return NextResponse.json({ error: 'Desktop auth exchange failed' }, { status: 500 });
  }
}
