import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { listing, listingImage } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { S3Client, DeleteObjectsCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const BUCKET = process.env.S3_BUCKET!;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const id = req.query.id as string;

  if (req.method === "DELETE") {
    // Verify listing belongs to user
    const [existing] = await db
      .select({ id: listing.id, status: listing.status })
      .from(listing)
      .where(and(eq(listing.id, id), eq(listing.userId, user.id)));

    if (!existing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    if (existing.status !== "submitted") {
      return res
        .status(400)
        .json({ error: "Only submitted listings can be deleted" });
    }

    // Get images to delete from storage
    const images = await db
      .select({ filename: listingImage.filename })
      .from(listingImage)
      .where(eq(listingImage.listingId, id));

    // Delete images from S3/R2
    if (images.length > 0) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: BUCKET,
          Delete: {
            Objects: images.map((img) => ({
              Key: `listings/${id}/${img.filename}`,
            })),
          },
        })
      );
    }

    // Delete listing (cascade deletes listing_image rows)
    await db
      .delete(listing)
      .where(and(eq(listing.id, id), eq(listing.userId, user.id)));

    return res.status(200).json({ success: true });
  }

  res.setHeader("Allow", "DELETE");
  res.status(405).end();
}
