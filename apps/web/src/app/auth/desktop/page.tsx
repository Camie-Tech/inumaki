import { redirect } from 'next/navigation';

export default async function DesktopAuthPage() {
  redirect('/dashboard');
}
