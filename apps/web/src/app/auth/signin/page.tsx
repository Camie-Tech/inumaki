import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { SignInClient } from './SignInClient';

interface SignInPageProps {
  searchParams: Promise<{
    desktop?: string;
  }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const isDesktopAuth = params.desktop === '1';
  const session = await auth();

  if (session?.user) {
    redirect(isDesktopAuth ? '/auth/desktop' : '/dashboard');
  }

  return <SignInClient isDesktopAuth={isDesktopAuth} />;
}
