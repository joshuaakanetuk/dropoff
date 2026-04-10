import type { NextApiRequest, NextApiResponse } from "next";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { requireAuth } from "@/lib/api-helpers";
import formidable from "formidable";
import sharp from "sharp";
import { db } from "@/lib/db";
import { listing, listingImage } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

export const config = { api: { bodyParser: false } };

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_COUNT = 16;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  const form = formidable({
    maxFileSize: MAX_FILE_SIZE,
    filter: ({ mimetype }) => ALLOWED_TYPES.includes(mimetype ?? ""),
  });

  const [fields, files] = await form.parse(req);
  const listingId = fields.listingId?.[0];

  if (!listingId) {
    return res.status(400).json({ error: "Missing listingId" });
  }

  // Verify listing belongs to user
  const [existing] = await db
    .select({ id: listing.id })
    .from(listing)
    .where(and(eq(listing.id, listingId), eq(listing.userId, user.id)));

  if (!existing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  // Check existing image count
  const [{ imageCount }] = await db
    .select({ imageCount: count() })
    .from(listingImage)
    .where(eq(listingImage.listingId, listingId));

  const uploaded = files.file ?? [];
  if (imageCount + uploaded.length > MAX_IMAGE_COUNT) {
    return res.status(400).json({ error: `Maximum ${MAX_IMAGE_COUNT} images per listing` });
  }

  const savedImages = [];

  for (let i = 0; i < uploaded.length; i++) {
    const file = uploaded[i];
    const id = crypto.randomUUID();
    const filename = `${id}.webp`;

    const buffer = await sharp(file.filepath)
      .resize(1200, 1200, { fit: "inside" })
      .webp({ quality: 80 })
      .toBuffer();

    const key = `listings/${listingId}/${filename}`;

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: "image/webp",
    }));

    const now = new Date().toISOString();
    await db.insert(listingImage).values({
      id,
      listingId,
      filename,
      originalName: file.originalFilename ?? filename,
      sortOrder: imageCount + i,
      createdAt: now,
    });

    savedImages.push({
      id,
      filename,
      url: process.env.R2_DEV_URL && process.env.NODE_ENV !== "production"
        ? `${process.env.R2_DEV_URL}/${BUCKET}/${key}`
        : `${process.env.AWS_ENDPOINT}/${BUCKET}/${key}`,
    });
  }

  return res.json({ images: savedImages });
}
