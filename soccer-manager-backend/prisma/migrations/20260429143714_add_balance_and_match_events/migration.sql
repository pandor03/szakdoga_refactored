/*
  Warnings:

  - You are about to drop the column `events` on the `MatchResult` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MatchResult" DROP COLUMN "events",
ADD COLUMN     "matchSummary" JSONB;

-- AlterTable
ALTER TABLE "SaveTeam" ADD COLUMN     "balance" INTEGER NOT NULL DEFAULT 50000000;

-- CreateTable
CREATE TABLE "MatchEvent" (
    "id" TEXT NOT NULL,
    "minute" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "teamSide" TEXT NOT NULL,
    "playerName" TEXT,
    "assistName" TEXT,
    "playerInName" TEXT,
    "playerOutName" TEXT,
    "matchResultId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MatchEvent_matchResultId_idx" ON "MatchEvent"("matchResultId");

-- AddForeignKey
ALTER TABLE "MatchEvent" ADD CONSTRAINT "MatchEvent_matchResultId_fkey" FOREIGN KEY ("matchResultId") REFERENCES "MatchResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
