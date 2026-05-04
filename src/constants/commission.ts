export const PLATFORM_COMMISSION_RATE = 0.15;

export function calculateCommission(subtotal: number) {
  const platformFee = +(subtotal * PLATFORM_COMMISSION_RATE).toFixed(2);
  const artistEarnings = +(subtotal - platformFee).toFixed(2);
  return { platformFee, artistEarnings };
}
