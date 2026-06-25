-- CreateTable
CREATE TABLE "UserFilters" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "excludedStacks" TEXT[],
    "excludedKeywords" TEXT[],
    "excludedCompanies" TEXT[],
    "requiredStacks" TEXT[],
    "contractTypes" TEXT[],
    "remoteOnly" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserFilters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserFilters_userId_key" ON "UserFilters"("userId");

-- AddForeignKey
ALTER TABLE "UserFilters" ADD CONSTRAINT "UserFilters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
