import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import SiteHead from '@/components/SiteHead';
import SiteLayout from '@/components/SiteLayout';
import { useCommerce } from '@/context/CommerceContext';
import { getCheckoutStatus, type CheckoutStatus } from '@/lib/api/payments';

export default function CheckoutSuccessPage() {
  const router = useRouter(); const { clearCart } = useCommerce();
  const [order, setOrder] = useState<CheckoutStatus | null>(null); const [error, setError] = useState('');
  const sessionId = typeof router.query.session_id === 'string' ? router.query.session_id : '';
  useEffect(() => {
    if (!router.isReady || !sessionId) { if (router.isReady) setError('This confirmation link is incomplete.'); return; }
    let active = true; let attempts = 0;
    const load = async () => { try { const next = await getCheckoutStatus(sessionId); if (!active) return; setOrder(next); if (next.status === 'PAID') clearCart();
      else if (++attempts < 6) window.setTimeout(() => void load(), 2000); } catch { if (active) setError('We could not verify this order yet.'); } };
    void load(); return () => { active = false; };
  }, [router.isReady, sessionId, clearCart]);
  const paid = order?.status === 'PAID';
  return <><SiteHead title="Payment status | SHOP.CO" description="Authoritative SHOP.CO payment confirmation." path="/checkout/success" />
    <SiteLayout><main className="checkout-page"><div className="container checkout-confirmation"><p className="issue-label">Payment / Webhook verified</p>
      <h1>{paid ? 'Your piece is secured.' : 'Confirming payment.'}</h1><p role="status" aria-live="polite">{error || (paid ? `Order ${order.orderNumber} is paid.` : 'Stripe is returning your payment status. This page does not mark an order paid by itself.')}</p>
      {order ? <dl className="checkout-totals"><div><dt>Status</dt><dd>{order.status}</dd></div><div><dt>Total</dt><dd>{new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(Number(order.total))}</dd></div></dl> : null}
      <Link className="button button--dark" href={paid ? '/account' : '/categories'}>{paid ? 'View your account' : 'Return to the archive'}</Link>
    </div></main></SiteLayout></>;
}
