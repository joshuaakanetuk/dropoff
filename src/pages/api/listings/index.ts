import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { listing, listingImage, pickup } from "@/db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method === "GET") {
    const listings = await db
      .select({
        listing: listing,
        pickupName: pickup.name,
      })
      .from(listing)
      .innerJoin(pickup, eq(listing.pickupId, pickup.id))
      .where(eq(listing.userId, user.id))
      .orderBy(desc(listing.createdAt));

    const listingIds = listings.map((r) => r.listing.id);
    const allImages = listingIds.length > 0
      ? await db
          .select()
          .from(listingImage)
          .where(inArray(listingImage.listingId, listingIds))
          .orderBy(listingImage.sortOrder)
      : [];

    const imagesByListing = new Map<string, typeof allImages>();
    for (const img of allImages) {
      const arr = imagesByListing.get(img.listingId) ?? [];
      arr.push(img);
      imagesByListing.set(img.listingId, arr);
    }

    const result = listings.map((row) => {
      const images = imagesByListing.get(row.listing.id) ?? [];
      return {
        ...row.listing,
        pickupName: row.pickupName,
        images: images.map((img) => ({
          ...img,
          url: process.env.R2_DEV_URL && process.env.NODE_ENV !== "production"
            ? `${process.env.R2_DEV_URL}/${process.env.S3_BUCKET}/listings/${row.listing.id}/${img.filename}`
            : `${process.env.AWS_ENDPOINT}/${process.env.S3_BUCKET}/listings/${row.listing.id}/${img.filename}`,
        })),
      };
    });

    return res.json(result);
  }

  if (req.method === "POST") {
    const { title, description, condition, pickupId, suggestedPrice } = req.body;

    if (!title || !description || !condition || !pickupId || suggestedPrice == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (typeof title !== "string" || title.length > 500) {
      return res.status(400).json({ error: "Title must be under 500 characters" });
    }

    if (typeof description !== "string" || description.length > 5000) {
      return res.status(400).json({ error: "Description must be under 5000 characters" });
    }

    const price = Number(suggestedPrice);
    if (isNaN(price) || price < 0 || price > 999999.99) {
      return res.status(400).json({ error: "Price must be between 0 and 999999.99" });
    }

    const validConditions = ["new", "like_new", "good", "fair"];
    if (!validConditions.includes(condition)) {
      return res.status(400).json({ error: "Invalid condition" });
    }

    // Verify pickup date exists and is open
    const [openPickup] = await db
      .select()
      .from(pickup)
      .where(and(eq(pickup.id, pickupId), eq(pickup.status, "open")));

    if (!openPickup) {
      return res.status(400).json({ error: "Pickup date not found or not open" });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const priceInCents = Math.round(price * 100);

    const [newListing] = await db
      .insert(listing)
      .values({
        id,
        userId: user.id,
        pickupId,
        title,
        description,
        condition,
        suggestedPrice: priceInCents,
        status: "submitted",
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return res.status(201).json(newListing);
  }

  res.setHeader("Allow", "GET, POST");
  res.status(405).end();
}
