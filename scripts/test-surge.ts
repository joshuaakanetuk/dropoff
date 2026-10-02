import "dotenv/config";

const SURGE_API = "https://api.surge.app";

const apiKey = process.env.SURGE_API_KEY;
const accountId = process.env.SURGE_ACCOUNT_ID;
const from = process.env.SURGE_FROM_NUMBER; // optional; Surge uses the account default when omitted
const to = process.argv[2] ?? process.env.TEST_PHONE;

if (!apiKey || !accountId) {
  console.error("Missing SURGE_API_KEY or SURGE_ACCOUNT_ID in .env");
  process.exit(1);
}

if (!to) {
  console.error("Usage: npm run test:surge -- +18015551234");
  console.error("       (recipient phone number in E.164 format)");
  process.exit(1);
}

if (!/^\+[1-9]\d{6,14}$/.test(to)) {
  console.error(`"${to}" is not E.164 format. Expected e.g. +18015551234`);
  process.exit(1);
}

async function main() {
  console.log(`Sending test SMS to ${to} via account ${accountId}...`);

  const res = await fetch(`${SURGE_API}/accounts/${accountId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to,
      body: `Dropoff test SMS ${new Date().toISOString()}`,
      ...(from ? { from } : {}),
    }),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    console.error(`Surge returned ${res.status}:`);
    console.error(JSON.stringify(json, null, 2));
    process.exit(1);
  }

  console.log("Message accepted by Surge:");
  console.log(JSON.stringify(json, null, 2));
  console.log(`\nMessage ID: ${json.id} — check delivery status in the Surge dashboard.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
