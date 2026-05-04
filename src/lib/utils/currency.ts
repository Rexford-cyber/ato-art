export function formatCurrency(amount: number | string | { toString(): string }, currency = "GHS") {
  const num = parseFloat(amount.toString());
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(num);
}

export function toKobo(amount: number) {
  return Math.round(amount * 100);
}
