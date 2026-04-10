import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { listing, listingImage, pickup, user } from "@/db/schema";
import { eq, desc, and, inArray, type SQL } from "drizzle-orm";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }

  const { status, pickupId } = req.query;

  const conditions: SQL[] = [];
  if (status && typeof status === "string") {
    conditions.push(eq(listing.status, status));
  }
  if (pickupId && typeof pickupId === "string") {
    conditions.push(eq(listing.pickupId, pickupId));
  }

  const listings = await db
    .select({
      listing: listing,
      userName: user.name,
      userEmail: user.email,
      pickupName: pickup.name,
      pickupDate: pickup.pickupDate,
    })
    .from(listing)
    .innerJoin(user, eq(listing.userId, user.id))
    .innerJoin(pickup, eq(listing.pickupId, pickup.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
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
      userName: row.userName,
      userEmail: row.userEmail,
      pickupName: row.pickupName,
      pickupDate: row.pickupDate,
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
