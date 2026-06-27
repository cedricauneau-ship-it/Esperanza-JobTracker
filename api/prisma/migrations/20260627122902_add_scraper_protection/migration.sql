-- AlterTable
ALTER TABLE "ScraperConfig" ADD COLUMN     "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pausedUntil" TIMESTAMP(3),
ALTER COLUMN "currentPage" SET DEFAULT 0;
