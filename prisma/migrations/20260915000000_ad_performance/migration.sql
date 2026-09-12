-- Add delivery stats to AdSlot (impressions/clicks via POST /api/ads/track)
ALTER TABLE "AdSlot" ADD COLUMN "impressions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "clicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lastShownAt" TIMESTAMP(3);
