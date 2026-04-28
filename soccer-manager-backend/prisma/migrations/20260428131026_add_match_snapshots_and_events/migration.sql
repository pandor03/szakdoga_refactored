/*
  Warnings:

  - You are about to drop the column `goalsScored` on the `SaveTeam` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MatchResult" ADD COLUMN     "awayBench" JSONB,
ADD COLUMN     "awayFormation" TEXT,
ADD COLUMN     "awayLineup" JSONB,
ADD COLUMN     "events" JSONB,
ADD COLUMN     "homeBench" JSONB,
ADD COLUMN     "homeFormation" TEXT,
ADD COLUMN     "homeLineup" JSONB;

-- AlterTable
ALTER TABLE "SaveTeam" DROP COLUMN "goalsScored";
