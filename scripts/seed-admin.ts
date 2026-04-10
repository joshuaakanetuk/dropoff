import "dotenv/config";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { auth } from "../src/lib/auth";
import { db } from "../src/lib/db";
import { user } from "../src/db/schema";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@dropoff.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? crypto.randomBytes(16).toString("hex");
const ADMIN_NAME = process.env.ADMIN_NAME ?? "Admin";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";

async function seed() {
  // Check if admin already exists
  const existing = await db.query.user.findFirst({
    where: eq(user.email, ADMIN_EMAIL),
  });

  if (existing) {
    console.log("Admin user already exists, skipping.");
    process.exit(0);
  }

  // Create the admin user via better-auth's sign-up
  const result = await auth.api.signUpEmail({
    body: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      name: ADMIN_NAME,
      username: ADMIN_USERNAME,
    },
  });

  if (!result?.user) {
    console.error("Failed to create admin user.");
    process.exit(1);
  }

  // Promote to admin role
  await db
    .update(user)
    .set({ role: "admin" })
    .where(eq(user.id, result.user.id));

  console.log("Admin user seeded successfully.");
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  if (!process.env.ADMIN_PASSWORD) {
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log("  (auto-generated — save this now, it won't be shown again)");
  }
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
