ALTER TABLE "cycle" RENAME TO "pickup";--> statement-breakpoint
ALTER TABLE "listing" RENAME COLUMN "cycleId" TO "pickupId";--> statement-breakpoint
ALTER TABLE "listing" DROP CONSTRAINT "listing_cycleId_cycle_id_fk";
--> statement-breakpoint
DROP INDEX "listing_cycleId_idx";--> statement-breakpoint
ALTER TABLE "listing" ADD CONSTRAINT "listing_pickupId_pickup_id_fk" FOREIGN KEY ("pickupId") REFERENCES "public"."pickup"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "listing_pickupId_idx" ON "listing" USING btree ("pickupId");