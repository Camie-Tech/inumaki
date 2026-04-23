import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { createDesktopAuthCode } from '@/lib/desktop-auth';
import { DesktopRedirectClient } from './DesktopRedirectClient';

export default async function DesktopAuthPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    redirect('/auth/signin?desktop=1');
  }

  const headerStore = await headers();
  const host = headerStore.get('x-forwarded-host') ?? headerStore.get('host');
  const protocol =
    headerStore.get('x-forwarded-proto') ??
    (host?.startsWith('localhost') || host?.startsWith('127.0.0.1') ? 'http' : 'https');
  const base =
    (host ? `${protocol}://${host}` : null) ??
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    'http://localhost:3000';
  const code = createDesktopAuthCode(session.user.id, session.user.email);

  return <DesktopRedirectClient base={base} code={code} />;
}
