-- CreateTable
CREATE TABLE "ScraperConfig" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "currentPage" INTEGER NOT NULL DEFAULT 1,
    "lastScrapedAt" TIMESTAMP(3),

    CONSTRAINT "ScraperConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScraperConfig_source_key" ON "ScraperConfig"("source");
