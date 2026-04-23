import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { db } from '../db';
import { sessions } from '../db/schema';

const DESKTOP_CODE_TTL_SECONDS = 60 * 5;
const DESKTOP_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

interface DesktopCodePayload {
  userId: string;
  email: string;
  exp: number;
}

function getDesktopAuthSecret(): string {
  const secret =
    process.env.AUTH_SECRET ??
    process.env.AUTH_SECRET_1 ??
    process.env.NEXTAUTH_SECRET ??
    process.env.AUTH_SECRET_2 ??
    process.env.AUTH_SECRET_3;

  if (!secret) {
    throw new Error('Missing auth secret for desktop auth');
  }

  return secret;
}

function signValue(value: string): string {
  return createHmac('sha256', getDesktopAuthSecret()).update(value).digest('base64url');
}

export function createDesktopAuthCode(userId: string, email: string): string {
  const payload: DesktopCodePayload = {
    userId,
    email,
    exp: Math.floor(Date.now() / 1000) + DESKTOP_CODE_TTL_SECONDS,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = signValue(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyDesktopAuthCode(code: string): DesktopCodePayload | null {
  const [encodedPayload, signature] = code.split('.');
  if (!encodedPayload || !signature) return null;

  const expectedSignature = signValue(encodedPayload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as DesktopCodePayload;

    if (!payload.userId || !payload.email || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function createDesktopSession(userId: string): Promise<string> {
  const sessionToken = randomUUID();

  await db.insert(sessions).values({
    id: randomUUID(),
    sessionToken,
    userId,
    expires: new Date(Date.now() + DESKTOP_SESSION_TTL_MS),
  });

  return sessionToken;
}
