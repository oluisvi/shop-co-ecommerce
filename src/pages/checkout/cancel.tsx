import Link from 'next/link';
import SiteHead from '@/components/SiteHead';
import SiteLayout from '@/components/SiteLayout';
export default function CheckoutCancelPage() {
  return <><SiteHead title="Payment cancelled | SHOP.CO" description="Return to your SHOP.CO bag." path="/checkout/cancel" /><SiteLayout>
    <main className="checkout-page"><div className="container checkout-confirmation"><p className="issue-label">Payment / Cancelled</p><h1>Your bag is still here.</h1>
      <p>No browser redirect can mark an order paid. Reserved stock is released when Stripe expires the session.</p><Link className="button button--dark" href="/checkout">Return to checkout</Link></div></main>
  </SiteLayout></>;
}
