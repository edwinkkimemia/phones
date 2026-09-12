-- AlterEnum: add GUIDES placement for guides index/guide ad slots
ALTER TYPE "AdPlacement" ADD VALUE 'GUIDES';

-- CreateTable: DB-backed buying guides (seeded from src/data/guides.ts)
CREATE TABLE "Guide" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cover" TEXT,
    "intro" TEXT NOT NULL,
    "sections" JSONB NOT NULL DEFAULT '[]',
    "relatedSlugs" TEXT[] NOT NULL DEFAULT '{}',
    "faqs" JSONB NOT NULL DEFAULT '[]',
    "keywords" TEXT[] NOT NULL DEFAULT '{}',
    "readMins" INTEGER NOT NULL DEFAULT 5,
    "updated" TEXT NOT NULL DEFAULT '',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guide_slug_key" ON "Guide"("slug");
