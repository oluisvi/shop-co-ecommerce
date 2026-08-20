import { FormEvent, useMemo, useRef, useState } from "react";
import Link from "next/link";
import SiteHead from "@/components/SiteHead";
import SiteLayout from "@/components/SiteLayout";
import { useCommerce } from "@/context/CommerceContext";
import { useAuth } from "@/context/AuthContext";
import { createCheckoutSession } from "@/lib/api/payments";
import { ApiError } from "@/lib/api/client";
import { buildOrderInput, type CheckoutErrors, type CheckoutFields, validateCheckout } from "@/lib/checkout";

const initialValues: CheckoutFields = {
  email: "", firstName: "", lastName: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "US",
};

export default function Checkout() {
  const { cart, cartDetails, cartIssues, subtotal, reconciling, refreshCart } = useCommerce();
  const { accessToken } = useAuth();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const errorSummary = useRef<HTMLDivElement>(null);
  const issueMessages = useMemo(() => cartIssues.map((issue) => issue.message), [cartIssues]);

  const setField = (field: keyof CheckoutFields, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateCheckout(values);
    setErrors(nextErrors); setServerError("");
    if (Object.keys(nextErrors).length) { requestAnimationFrame(() => errorSummary.current?.focus()); return; }
    if (!cart.length) { setServerError("Your bag is empty."); requestAnimationFrame(() => errorSummary.current?.focus()); return; }
    setSubmitting(true);
    try {
      const fresh = await refreshCart();
      if (fresh.issues.length) {
        setServerError("Your bag changed. Resolve the inventory issue before placing the order.");
        requestAnimationFrame(() => errorSummary.current?.focus());
        return;
      }
      const session = await createCheckoutSession(buildOrderInput(values, cart), accessToken);
      window.location.assign(session.url);
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.statusCode === 409 ? "Inventory changed while placing the order. Review your bag and try again." : error.message);
      } else setServerError("The order could not be created. Please try again.");
      requestAnimationFrame(() => errorSummary.current?.focus());
    } finally { setSubmitting(false); }
  };

  return <>
    <SiteHead title="Checkout | SHOP.CO" description="Reserve your SHOP.CO edit and continue to secure Stripe payment." path="/checkout" />
    <SiteLayout><section className="checkout-page"><div className="container"><nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Checkout</span></nav><div className="checkout-heading"><p className="issue-label">Secure checkout</p><h1>Complete your order.</h1><p>Review your edit, then continue to Stripe-hosted secure payment.</p></div>
      {!cart.length ? <div className="checkout-empty"><h2>Your bag is empty.</h2><p>Add a piece before starting checkout.</p><Link className="button button--dark" href="/categories">Explore products</Link></div> : <div className="checkout-layout">
        <form className="checkout-form" noValidate onSubmit={submit}>
          {(serverError || Object.keys(errors).length) ? <div ref={errorSummary} className="checkout-error-summary" role="alert" tabIndex={-1}><strong>Check your details</strong><p>{serverError || "Some required fields need attention."}</p></div> : null}
          <fieldset><legend>Contact</legend><Field id="email" label="Email" type="email" value={values.email} error={errors.email} autoComplete="email" onChange={(value) => setField("email", value)} /></fieldset>
          <fieldset><legend>Shipping address</legend><div className="checkout-grid"><Field id="firstName" label="First name" value={values.firstName} error={errors.firstName} autoComplete="given-name" onChange={(value) => setField("firstName", value)} /><Field id="lastName" label="Last name" value={values.lastName} error={errors.lastName} autoComplete="family-name" onChange={(value) => setField("lastName", value)} /></div><Field id="addressLine1" label="Address" value={values.addressLine1} error={errors.addressLine1} autoComplete="address-line1" onChange={(value) => setField("addressLine1", value)} /><Field id="addressLine2" label="Apartment, suite, etc. (optional)" value={values.addressLine2} error={errors.addressLine2} autoComplete="address-line2" onChange={(value) => setField("addressLine2", value)} /><div className="checkout-grid"><Field id="city" label="City" value={values.city} error={errors.city} autoComplete="address-level2" onChange={(value) => setField("city", value)} /><Field id="state" label="State / region" value={values.state} error={errors.state} autoComplete="address-level1" onChange={(value) => setField("state", value)} /><Field id="postalCode" label="Postal code" value={values.postalCode} error={errors.postalCode} autoComplete="postal-code" onChange={(value) => setField("postalCode", value)} /><Field id="country" label="Country code" value={values.country} error={errors.country} autoComplete="country" maxLength={2} onChange={(value) => setField("country", value.toUpperCase())} /></div></fieldset>
          <button className="button button--dark checkout-submit" type="submit" disabled={submitting || reconciling || issueMessages.length > 0}>{submitting ? "Preparing secure payment…" : issueMessages.length ? "Resolve bag issues first" : "Continue to secure payment"}</button><p className="checkout-payment-note">Payment details are collected by Stripe. SHOP.CO never receives your card number or CVC.</p>
        </form>
        <aside className="checkout-summary" aria-label="Order summary"><p className="issue-label">Order summary</p><h2>Your edit</h2>{issueMessages.length ? <div className="checkout-stock-warning" role="status">{issueMessages.map((message, index) => <p key={index}>{message}</p>)}</div> : null}<div className="checkout-lines">{cartDetails.map((item) => { const line = cart.find((value) => value.variantId === item.variantId); return line ? <div className="checkout-line" key={item.variantId}><div><strong>{item.product.name}</strong><span>{[item.variant.color?.name, item.variant.size].filter(Boolean).join(" / ") || "Default"} · Qty {line.quantity}</span></div><strong>${(item.variant.price * line.quantity).toFixed(2)}</strong></div> : null; })}</div><dl className="checkout-totals"><div><dt>Current subtotal</dt><dd>${subtotal.toFixed(2)}</dd></div><div><dt>Shipping</dt><dd>Calculated by server</dd></div></dl></aside>
      </div>}
    </div></section></SiteLayout>
  </>;
}

function Field({ id, label, value, error, onChange, type = "text", autoComplete, maxLength }: { id: keyof CheckoutFields; label: string; value: string; error?: string; onChange: (value: string) => void; type?: string; autoComplete?: string; maxLength?: number }) {
  const errorId = `${id}-error`;
  return <label className="checkout-field" htmlFor={id}><span>{label}</span><input id={id} name={id} type={type} value={value} autoComplete={autoComplete} maxLength={maxLength} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} onChange={(event) => onChange(event.target.value)} />{error ? <small id={errorId}>{error}</small> : null}</label>;
}
