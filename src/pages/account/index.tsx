import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import SiteHead from '@/components/SiteHead';
import { useAuth } from '@/context/AuthContext';

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  useEffect(() => { if (!loading && !user) void router.replace('/auth/sign-in'); }, [loading, user, router]);
  if (loading || !user) return <main className="auth-page"><p role="status">Checking your account…</p></main>;
  return <main className="auth-page"><SiteHead title="Your archive | SHOP.CO" description="Profile and order history." path="/account" />
    <Link href="/" className="auth-page__brand">SHOP.CO</Link><section className="auth-panel"><p className="eyebrow">Customer archive</p><h1>Your account</h1>
      <p>Signed in as <strong>{user.email}</strong></p><p>Your verified orders will appear here after the API profile is configured.</p>
      <button className="primary-action" onClick={() => void signOut().then(() => router.push('/'))}>Sign out</button></section></main>;
}
