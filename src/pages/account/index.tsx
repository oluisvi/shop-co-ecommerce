import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import SiteHead from '@/components/SiteHead';
import { useAuth } from '@/context/AuthContext';
import { getAccountProfile, listAccountOrders, type AccountOrder, type AccountProfile } from '@/lib/api/account';

export default function AccountPage() {
  const router = useRouter();
  const { user, accessToken, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [message, setMessage] = useState('');
  useEffect(() => { if (!loading && !user) void router.replace('/auth/sign-in'); }, [loading, user, router]);
  useEffect(() => {
    if (!accessToken) return;
    let active = true;
    void Promise.all([getAccountProfile(accessToken), listAccountOrders(accessToken)])
      .then(([nextProfile, nextOrders]) => { if (active) { setProfile(nextProfile); setOrders(nextOrders); } })
      .catch(() => { if (active) setMessage('Your account data could not be loaded. Please try again.'); });
    return () => { active = false; };
  }, [accessToken]);
  if (loading || !user) return <main className="auth-page"><p role="status">Checking your account…</p></main>;
  return <main className="auth-page"><SiteHead title="Your archive | SHOP.CO" description="Profile and order history." path="/account" />
    <Link href="/" className="auth-page__brand">SHOP.CO</Link><section className="auth-panel"><p className="eyebrow">Customer archive</p><h1>Your account</h1>
      <p>Signed in as <strong>{profile?.email ?? user.email}</strong></p>
      <p className="auth-message" role="status" aria-live="polite">{message}</p>
      <section aria-labelledby="order-history"><h2 id="order-history">Order history</h2>
        {orders.length ? <ul className="account-orders">{orders.map((order) => <li key={order.id}>
          <div><strong>{order.orderNumber}</strong><span>{order.status.replaceAll('_', ' ')}</span></div>
          <div><span>{new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(order.createdAt))}</span><strong>{new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(Number(order.total))}</strong></div>
        </li>)}</ul> : <p>No account orders yet. Guest orders are not claimed automatically.</p>}
      </section>
      <button className="primary-action" onClick={() => void signOut().then(() => router.push('/'))}>Sign out</button></section></main>;
}
