// SMS transport via Surge (https://docs.surge.app).
// Sends are queued asynchronously: a 201 response means Surge accepted the
// message, delivery is confirmed later via the message.delivered webhook.
// Phone numbers must be E.164 format (e.g. +18015551234).

export function isSmsConfigured(): boolean {
  return Boolean(process.env.SURGE_API_KEY && process.env.SURGE_ACCOUNT_ID);
}

// Throws on failure. Callers should check isSmsConfigured() first to
// distinguish "not configured" from a real send error.
export async function sendSms(to: string, text: string): Promise<void> {
  if (!isSmsConfigured()) {
    throw new Error("SMS not configured: SURGE_API_KEY/SURGE_ACCOUNT_ID not set");
  }

  const apiKey = process.env.SURGE_API_KEY;
  const accountId = process.env.SURGE_ACCOUNT_ID;
  const from = process.env.SURGE_FROM_NUMBER; // optional; Surge uses the account default when omitted

  const res = await fetch(
    `https://api.surge.app/accounts/${accountId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        body: text,
        ...(from ? { from } : {}),
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(
      `Surge returned ${res.status}: ${err?.error?.message ?? res.statusText}`
    );
  }
}
