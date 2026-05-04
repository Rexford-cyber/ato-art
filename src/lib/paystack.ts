const PAYSTACK_BASE = "https://api.paystack.co";

async function paystackRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!data.status) throw new Error(data.message ?? "Paystack request failed");
  return data.data as T;
}

export interface PaystackInitResult {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export async function initializeTransaction(params: {
  email: string;
  amount: number; // in kobo/pesewas (multiply by 100)
  reference: string;
  currency: string;
  callback_url: string;
  metadata?: Record<string, unknown>;
}) {
  return paystackRequest<PaystackInitResult>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      ...params,
      channels: ["card", "mobile_money", "bank"],
    }),
  });
}

export interface PaystackVerifyResult {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  channel: string;
  paid_at: string;
  metadata: Record<string, unknown>;
}

export async function verifyTransaction(reference: string) {
  return paystackRequest<PaystackVerifyResult>(`/transaction/verify/${reference}`);
}
