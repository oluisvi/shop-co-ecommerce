export function reconciledSubtotal(items: Array<{ quantity: number; variant: { price: number } }>) {
  return items.reduce((total, item) => total + item.quantity * item.variant.price, 0);
}

export function hasBlockingCartIssues(issues: Array<{ type: string }>) {
  return issues.some((issue) =>
    issue.type === "REMOVED" || issue.type === "UNAVAILABLE" || issue.type === "INSUFFICIENT_STOCK" || issue.type === "API_UNAVAILABLE",
  );
}
