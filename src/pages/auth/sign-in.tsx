import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/router';
import AuthFormShell from '@/components/AuthFormShell';
import { supabase } from '@/context/AuthContext';

export default function SignInPage() {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!supabase) return setMessage('Authentication is not configured.');
    setBusy(true); const data = new FormData(event.currentTarget); const { error } = await supabase.auth.signInWithPassword({ email: String(data.get('email')), password: String(data.get('password')) });
    setBusy(false); if (error) return setMessage(error.message); await router.push('/account'); };
  return <AuthFormShell title="Sign in" eyebrow="Customer archive" onSubmit={submit} busy={busy} message={message}>
    <label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" minLength={8} required /></label>
  </AuthFormShell>;
}
