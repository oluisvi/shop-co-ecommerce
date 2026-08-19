import { FormEvent, useState } from "react";
import { validateEmail } from "@/lib/validation";

export default function Newsletter() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const error = validateEmail(String(form.get("email") ?? ""));

    if (error) {
      setStatus("error");
      setMessage(error);
      return;
    }

    setStatus("success");
    setMessage("You’re on the demo list. No email has been stored or sent.");
    event.currentTarget.reset();
  }

  return (
    <section
      id="newsletter"
      className="newsletter newsletter--editorial"
      aria-labelledby="newsletter-title"
    >
      <div className="container newsletter-shell">
        <div className="newsletter-copy">
          <div className="newsletter-kicker" aria-hidden="true">
            <span>Private line</span>
            <span>01 / SHOP.CO</span>
          </div>

          <p className="eyebrow">The next drop</p>
          <h2 id="newsletter-title">Stay inside the edit.</h2>
          <p className="newsletter-intro">
            New pieces, visual stories and selected releases — one quiet note at a time.
          </p>
        </div>

        <form className="newsletter-form" onSubmit={submit} noValidate>
          <label htmlFor="newsletter-email">Email address</label>

          <div className="newsletter-field">
            <input
              id="newsletter-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              aria-describedby="newsletter-message"
            />

            <button className="newsletter-button" type="submit">
              <span>Join the edit</span>
              <span className="newsletter-button__arrow" aria-hidden="true">
                ↗
              </span>
            </button>
          </div>

          <p
            id="newsletter-message"
            className={`form-message form-message--${status}`}
            aria-live="polite"
          >
            {message || "Demo only — your address will not be stored."}
          </p>
        </form>
      </div>
    </section>
  );
}