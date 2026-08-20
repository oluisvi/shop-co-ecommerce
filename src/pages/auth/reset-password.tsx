import { useState, type FormEvent } from 'react';
import AuthFormShell from '@/components/AuthFormShell';
import { supabase } from '@/context/AuthContext';

export default function ResetPasswordPage() {
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!supabase) return setMessage('Authentication is not configured.');
    setBusy(true); const data = new FormData(event.currentTarget); const { error } = await supabase.auth.resetPasswordForEmail(String(data.get('email')), { redirectTo: `${window.location.origin}/auth/update-password` });
    setBusy(false); setMessage(error?.message ?? 'If that account exists, a reset link is on its way.'); };
  return <AuthFormShell title="Reset password" eyebrow="Account recovery" onSubmit={submit} busy={busy} message={message}><label>Email<input name="email" type="email" autoComplete="email" required /></label></AuthFormShell>;
}
