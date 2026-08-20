import { useState, type FormEvent } from "react";
import { useRouter } from "next/router";
import AuthFormShell from "@/components/AuthFormShell";
import { supabase } from "@/context/AuthContext";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return setMessage("Authentication is not configured.");
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    const confirmation = String(data.get("confirmation"));
    if (password.length < 8) return setMessage("Use at least 8 characters.");
    if (password !== confirmation) return setMessage("Passwords do not match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setMessage(error.message);
    setMessage("Password updated. Redirecting to your account…");
    void router.push("/account");
  };
  return <AuthFormShell title="Choose a new password" eyebrow="Account recovery" onSubmit={submit} busy={busy} message={message}>
    <label>New password<input name="password" type="password" minLength={8} autoComplete="new-password" required /></label>
    <label>Confirm password<input name="confirmation" type="password" minLength={8} autoComplete="new-password" required /></label>
  </AuthFormShell>;
}
