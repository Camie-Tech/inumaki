import type { Metadata } from 'next';

// Auth surface is private/transactional — keep it out of search indexes.
// A nested layout covers every /auth/* route, including the client-component
// pages (signin, error) that cannot export their own metadata.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
