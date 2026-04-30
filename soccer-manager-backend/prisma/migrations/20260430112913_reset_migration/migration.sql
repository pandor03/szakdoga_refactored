/*
  Warnings:

  - You are about to drop the column `fitness` on the `SavePlayer` table. All the data in the column will be lost.
  - You are about to drop the column `injured` on the `SavePlayer` table. All the data in the column will be lost.
  - You are about to drop the column `stadiumLevel` on the `SaveTeam` table. All the data in the column will be lost.
  - You are about to drop the column `tactic` on the `SaveTeam` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MatchResult" ADD COLUMN     "awayBench" JSONB,
ADD COLUMN     "awayFormation" TEXT,
ADD COLUMN     "awayLineup" JSONB,
ADD COLUMN     "homeBench" JSONB,
ADD COLUMN     "homeFormation" TEXT,
ADD COLUMN     "homeLineup" JSONB,
ADD COLUMN     "matchSummary" JSONB;

-- AlterTable
ALTER TABLE "SavePlayer" DROP COLUMN "fitness",
DROP COLUMN "injured",
ADD COLUMN     "goalsScored" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SaveTeam" DROP COLUMN "stadiumLevel",
DROP COLUMN "tactic",
ADD COLUMN     "balance" INTEGER NOT NULL DEFAULT 50000000,
ADD COLUMN     "tacticStyle" TEXT NOT NULL DEFAULT 'balanced',
ALTER COLUMN "budget" SET DEFAULT 100000000;
