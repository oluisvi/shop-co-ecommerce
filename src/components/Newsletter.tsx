import { FormEvent, useState } from "react";
import { validateEmail } from "@/lib/validation";

export default function Newsletter() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const error = validateEmail(String(form.get("email") ?? ""));
    if (error) { setStatus("error"); setMessage(error); return; }
    setStatus("success");
    setMessage("You’re on the demo list. No email has been stored or sent.");
    event.currentTarget.reset();
  }

  return (
    <section id="newsletter" className="newsletter" aria-labelledby="newsletter-title">
      <div className="container newsletter-inner">
        <div><p className="eyebrow eyebrow--light">The next issue</p><h2 id="newsletter-title">Stay inside the edit.</h2></div>
        <form onSubmit={submit} noValidate>
          <label htmlFor="newsletter-email">Email address</label>
          <div className="newsletter-field"><input id="newsletter-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" aria-describedby="newsletter-message" /><button type="submit">Subscribe</button></div>
          <p id="newsletter-message" className={`form-message form-message--${status}`} aria-live="polite">{message || "Demo only—your address will not be stored."}</p>
        </form>
      </div>
    </section>
  );
}
