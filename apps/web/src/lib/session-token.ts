import type { NextRequest } from 'next/server';
import { and, eq, gt } from 'drizzle-orm';
import { db } from '../db';
import { sessions, users } from '../db/schema';

export interface SessionTokenUser {
  id: string;
  email: string;
  isActive: boolean;
}

export function extractBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;

  return token.trim() || null;
}

export async function getUserFromSessionToken(token: string): Promise<SessionTokenUser | null> {
  if (!token.trim()) return null;

  const [result] = await db
    .select({
      id: users.id,
      email: users.email,
      isActive: users.isActive,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.sessionToken, token), gt(sessions.expires, new Date())));

  if (!result) return null;

  return result;
}
