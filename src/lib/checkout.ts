export type CheckoutFields = {
  email: string; firstName: string; lastName: string; addressLine1: string; addressLine2: string;
  city: string; state: string; postalCode: string; country: string;
};
export type CheckoutErrors = Partial<Record<keyof CheckoutFields, string>>;
export function validateCheckout(values: CheckoutFields): CheckoutErrors {
  const errors: CheckoutErrors = {};
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = "Enter a valid email address.";
  const required: Exclude<keyof CheckoutFields, "email" | "addressLine2">[] = ["firstName", "lastName", "addressLine1", "city", "state", "postalCode", "country"];
  for (const field of required) if (!values[field].trim()) errors[field] = "This field is required.";
  if (values.country.trim() && !/^[A-Za-z]{2}$/.test(values.country.trim())) errors.country = "Use a 2-letter country code.";
  return errors;
}

export function buildOrderInput(values: CheckoutFields, items: Array<{ variantId: string; quantity: number }>) {
  return {
    customer: {
      email: values.email.trim(),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
    },
    shippingAddress: {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      addressLine1: values.addressLine1.trim(),
      ...(values.addressLine2.trim() ? { addressLine2: values.addressLine2.trim() } : {}),
      city: values.city.trim(),
      state: values.state.trim(),
      postalCode: values.postalCode.trim(),
      country: values.country.trim().toUpperCase(),
    },
    items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
  };
}
