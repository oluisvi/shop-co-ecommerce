import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState, type FormEvent } from 'react';
import SiteHead from '@/components/SiteHead';
import { useAuth } from '@/context/AuthContext';
import { listAccountOrders, updateAccountProfile, type AccountOrder } from '@/lib/api/account';
import { buildProfileUpdate } from '@/lib/account-profile';

export default function AccountPage() {
  const router = useRouter();
  const { user, accessToken, loading, profile, profileLoading, refreshProfile, signOut } = useAuth();
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (!loading && !user) void router.replace('/auth/sign-in'); }, [loading, user, router]);
  useEffect(() => {
    if (!accessToken) return;
    let active = true;
    void listAccountOrders(accessToken)
      .then((nextOrders) => { if (active) setOrders(nextOrders); })
      .catch(() => { if (active) setMessage('Your account data could not be loaded. Please try again.'); });
    return () => { active = false; };
  }, [accessToken]);
  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) return;
    setSaving(true); setMessage('');
    const data = new FormData(event.currentTarget);
    try {
      await updateAccountProfile(accessToken, buildProfileUpdate({
        firstName: String(data.get('firstName') ?? ''),
        lastName: String(data.get('lastName') ?? ''),
        phone: String(data.get('phone') ?? ''),
      }));
      await refreshProfile();
      setMessage('Profile updated.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Your profile could not be updated.');
    } finally { setSaving(false); }
  };
  if (loading || profileLoading || !user) return <main className="auth-page"><p role="status">Checking your account…</p></main>;
  return <main className="auth-page"><SiteHead title="Your archive | SHOP.CO" description="Profile and order history." path="/account" />
    <Link href="/" className="auth-page__brand">SHOP.CO</Link><section className="auth-panel"><p className="eyebrow">Customer archive</p><h1>Your account</h1>
      <p>Signed in as <strong>{profile?.email ?? user.email}</strong></p>
      <p className="auth-message" role="status" aria-live="polite">{message}</p>
      {profile?.role === 'SELLER' ? <p><Link href="/studio">Open Seller Studio</Link></p> : null}
      <form key={profile?.id ?? 'profile'} className="auth-form" onSubmit={submitProfile}>
        <label>First name<input name="firstName" maxLength={80} defaultValue={profile?.firstName ?? ''} autoComplete="given-name" /></label>
        <label>Last name<input name="lastName" maxLength={80} defaultValue={profile?.lastName ?? ''} autoComplete="family-name" /></label>
        <label>Phone<input name="phone" type="tel" maxLength={30} defaultValue={profile?.phone ?? ''} autoComplete="tel" /></label>
        <button className="primary-action" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button>
      </form>
      <section aria-labelledby="order-history"><h2 id="order-history">Order history</h2>
        {orders.length ? <ul className="account-orders">{orders.map((order) => <li key={order.id}>
          <div><strong>{order.orderNumber}</strong><span>{order.status.replaceAll('_', ' ')}</span></div>
          <div><span>{new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(order.createdAt))}</span><strong>{new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(Number(order.total))}</strong></div>
        </li>)}</ul> : <p>No account orders yet. Guest orders are not claimed automatically.</p>}
      </section>
      <button className="primary-action" onClick={() => void signOut().then(() => router.push('/'))}>Sign out</button></section></main>;
}
