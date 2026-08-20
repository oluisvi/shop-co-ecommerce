import { useState, type FormEvent } from 'react';
import AuthFormShell from '@/components/AuthFormShell';
import { supabase } from '@/context/AuthContext';

export default function SignUpPage() {
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!supabase) return setMessage('Authentication is not configured.');
    setBusy(true); const data = new FormData(event.currentTarget); const { error } = await supabase.auth.signUp({ email: String(data.get('email')), password: String(data.get('password')), options: { emailRedirectTo: `${window.location.origin}/account` } });
    setBusy(false); setMessage(error?.message ?? 'Check your email to verify your account.'); };
  return <AuthFormShell title="Create account" eyebrow="Join the archive" onSubmit={submit} busy={busy} message={message}>
    <label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" autoComplete="new-password" minLength={8} required /></label>
  </AuthFormShell>;
}
