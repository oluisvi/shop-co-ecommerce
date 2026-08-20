import type { FormEvent, ReactNode } from 'react';
import Link from 'next/link';
import SiteHead from './SiteHead';

export default function AuthFormShell({ title, eyebrow, onSubmit, busy, message, children }: {
  title: string; eyebrow: string; onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  busy: boolean; message: string; children: ReactNode;
}) {
  return <main className="auth-page"><SiteHead title={`${title} | SHOP.CO`} description="Secure SHOP.CO customer account." path="/auth/sign-in" />
    <Link href="/" className="auth-page__brand">SHOP.CO</Link>
    <section className="auth-panel" aria-labelledby="auth-title"><p className="eyebrow">{eyebrow}</p><h1 id="auth-title">{title}</h1>
      <form onSubmit={onSubmit}>{children}<button className="primary-action" disabled={busy}>{busy ? 'Please wait…' : title}</button></form>
      <p className="auth-message" role="status" aria-live="polite">{message}</p>
      <nav aria-label="Account links"><Link href="/auth/sign-in">Sign in</Link><Link href="/auth/sign-up">Create account</Link><Link href="/auth/reset-password">Reset password</Link></nav>
    </section></main>;
}
