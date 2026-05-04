export function formatCurrency(amount: number | string, currency = "GHS") {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(num);
}

export function toKobo(amount: number) {
  return Math.round(amount * 100);
}
