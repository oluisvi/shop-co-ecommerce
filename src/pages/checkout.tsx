import { FormEvent, useMemo, useRef, useState } from "react";
import Link from "next/link";
import SiteHead from "@/components/SiteHead";
import SiteLayout from "@/components/SiteLayout";
import { useCommerce } from "@/context/CommerceContext";
import { createOrder, type CreatedOrder } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import { buildOrderInput, type CheckoutErrors, type CheckoutFields, validateCheckout } from "@/lib/checkout";

const initialValues: CheckoutFields = {
  email: "", firstName: "", lastName: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "US",
};

export default function Checkout() {
  const { cart, cartDetails, cartIssues, subtotal, reconciling, refreshCart, clearCart } = useCommerce();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<CreatedOrder | null>(null);
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
      const created = await createOrder(buildOrderInput(values, cart));
      setOrder(created); clearCart();
      window.scrollTo({ top: 0 });
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.statusCode === 409 ? "Inventory changed while placing the order. Review your bag and try again." : error.message);
      } else setServerError("The order could not be created. Please try again.");
      requestAnimationFrame(() => errorSummary.current?.focus());
    } finally { setSubmitting(false); }
  };

  if (order) return <>
    <SiteHead title={`Order ${order.orderNumber} | SHOP.CO`} description="SHOP.CO order confirmation." path="/checkout" />
    <SiteLayout><section className="checkout-page"><div className="container checkout-confirmation"><p className="issue-label">Order / Created</p><h1>Order received.</h1><p className="checkout-order-number">{order.orderNumber}</p><p>Your order is recorded with status <strong>{order.status}</strong>. No payment has been processed in this phase.</p><dl className="checkout-totals"><div><dt>Subtotal</dt><dd>${order.subtotal.toFixed(2)}</dd></div><div><dt>Shipping</dt><dd>${order.shipping.toFixed(2)}</dd></div><div><dt>Total</dt><dd>${order.total.toFixed(2)} {order.currency}</dd></div></dl><Link className="button button--dark" href="/categories">Continue shopping</Link></div></section></SiteLayout>
  </>;

  return <>
    <SiteHead title="Checkout | SHOP.CO" description="Create a SHOP.CO order with live inventory validation." path="/checkout" />
    <SiteLayout><section className="checkout-page"><div className="container"><nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Checkout</span></nav><div className="checkout-heading"><p className="issue-label">Checkout / Phase 3</p><h1>Complete your order.</h1><p>Contact and shipping only. Payment is not collected yet.</p></div>
      {!cart.length ? <div className="checkout-empty"><h2>Your bag is empty.</h2><p>Add a piece before starting checkout.</p><Link className="button button--dark" href="/categories">Explore products</Link></div> : <div className="checkout-layout">
        <form className="checkout-form" noValidate onSubmit={submit}>
          {(serverError || Object.keys(errors).length) ? <div ref={errorSummary} className="checkout-error-summary" role="alert" tabIndex={-1}><strong>Check your details</strong><p>{serverError || "Some required fields need attention."}</p></div> : null}
          <fieldset><legend>Contact</legend><Field id="email" label="Email" type="email" value={values.email} error={errors.email} autoComplete="email" onChange={(value) => setField("email", value)} /></fieldset>
          <fieldset><legend>Shipping address</legend><div className="checkout-grid"><Field id="firstName" label="First name" value={values.firstName} error={errors.firstName} autoComplete="given-name" onChange={(value) => setField("firstName", value)} /><Field id="lastName" label="Last name" value={values.lastName} error={errors.lastName} autoComplete="family-name" onChange={(value) => setField("lastName", value)} /></div><Field id="addressLine1" label="Address" value={values.addressLine1} error={errors.addressLine1} autoComplete="address-line1" onChange={(value) => setField("addressLine1", value)} /><Field id="addressLine2" label="Apartment, suite, etc. (optional)" value={values.addressLine2} error={errors.addressLine2} autoComplete="address-line2" onChange={(value) => setField("addressLine2", value)} /><div className="checkout-grid"><Field id="city" label="City" value={values.city} error={errors.city} autoComplete="address-level2" onChange={(value) => setField("city", value)} /><Field id="state" label="State / region" value={values.state} error={errors.state} autoComplete="address-level1" onChange={(value) => setField("state", value)} /><Field id="postalCode" label="Postal code" value={values.postalCode} error={errors.postalCode} autoComplete="postal-code" onChange={(value) => setField("postalCode", value)} /><Field id="country" label="Country code" value={values.country} error={errors.country} autoComplete="country" maxLength={2} onChange={(value) => setField("country", value.toUpperCase())} /></div></fieldset>
          <button className="button button--dark checkout-submit" type="submit" disabled={submitting || reconciling || issueMessages.length > 0}>{submitting ? "Creating order…" : issueMessages.length ? "Resolve bag issues first" : "Create order"}</button><p className="checkout-payment-note">This creates an order only. It does not charge a card or mark the order as paid.</p>
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
