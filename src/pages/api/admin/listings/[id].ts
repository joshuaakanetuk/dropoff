import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { listing } from "@/db/schema";
import { eq } from "drizzle-orm";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  submitted: ["accepted"],
  accepted: ["picked_up", "listed"],
  picked_up: ["listed"],
  listed: ["sold", "unsold"],
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const { id } = req.query;

  if (req.method === "PATCH") {
    const { status, adminNotes, soldPrice } = req.body;

    const [existing] = await db
      .select()
      .from(listing)
      .where(eq(listing.id, id as string));

    if (!existing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    if (status) {
      const allowed = ALLOWED_TRANSITIONS[existing.status];
      if (!allowed || !allowed.includes(status)) {
        return res.status(400).json({
          error: `Cannot transition from '${existing.status}' to '${status}'`,
        });
      }
    }

    const now = new Date().toISOString();
    const updates: Partial<typeof listing.$inferInsert> = { updatedAt: now };

    if (status) {
      updates.status = status;
    }
    if (adminNotes !== undefined) {
      updates.adminNotes = adminNotes;
    }
    if (soldPrice !== undefined) {
      const price = Number(soldPrice);
      if (isNaN(price) || price < 0 || price > 999999.99) {
        return res.status(400).json({ error: "Invalid sold price" });
      }
      updates.soldPrice = Math.round(price * 100);
    }

    const [updated] = await db
      .update(listing)
      .set(updates)
      .where(eq(listing.id, id as string))
      .returning();

    return res.json(updated);
  }

  res.setHeader("Allow", "PATCH");
  res.status(405).end();
}
