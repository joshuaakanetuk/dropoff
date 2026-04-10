import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { pickup } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method === "GET") {
    const pickups = await db
      .select()
      .from(pickup)
      .orderBy(desc(pickup.pickupDate));
    return res.json(pickups);
  }

  if (req.method === "POST") {
    const { name, pickupDate } = req.body;

    if (!name || !pickupDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (typeof name !== "string" || name.length > 255) {
      return res.status(400).json({ error: "Name must be under 255 characters" });
    }

    if (typeof pickupDate !== "string" || !/^\d{4}-\d{2}-\d{2}/.test(pickupDate)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const [newPickup] = await db
      .insert(pickup)
      .values({
        id,
        name,
        pickupDate,
        status: "open",
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return res.status(201).json(newPickup);
  }

  if (req.method === "PATCH") {
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: "Missing id or status" });
    }

    if (!["open", "closed", "completed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const now = new Date().toISOString();
    const [updated] = await db
      .update(pickup)
      .set({ status, updatedAt: now })
      .where(eq(pickup.id, id))
      .returning();

    return res.json(updated);
  }

  res.setHeader("Allow", "GET, POST, PATCH");
  res.status(405).end();
}
