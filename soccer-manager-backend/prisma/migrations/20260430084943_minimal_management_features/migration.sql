/*
  Warnings:

  - You are about to drop the column `awayBench` on the `MatchResult` table. All the data in the column will be lost.
  - You are about to drop the column `awayFormation` on the `MatchResult` table. All the data in the column will be lost.
  - You are about to drop the column `awayLineup` on the `MatchResult` table. All the data in the column will be lost.
  - You are about to drop the column `homeBench` on the `MatchResult` table. All the data in the column will be lost.
  - You are about to drop the column `homeFormation` on the `MatchResult` table. All the data in the column will be lost.
  - You are about to drop the column `homeLineup` on the `MatchResult` table. All the data in the column will be lost.
  - You are about to drop the column `matchSummary` on the `MatchResult` table. All the data in the column will be lost.
  - You are about to drop the column `goalsScored` on the `SavePlayer` table. All the data in the column will be lost.
  - You are about to drop the column `balance` on the `SaveTeam` table. All the data in the column will be lost.
  - You are about to drop the column `tacticStyle` on the `SaveTeam` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MatchResult" DROP COLUMN "awayBench",
DROP COLUMN "awayFormation",
DROP COLUMN "awayLineup",
DROP COLUMN "homeBench",
DROP COLUMN "homeFormation",
DROP COLUMN "homeLineup",
DROP COLUMN "matchSummary";

-- AlterTable
ALTER TABLE "SavePlayer" DROP COLUMN "goalsScored",
ADD COLUMN     "fitness" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "injured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SaveTeam" DROP COLUMN "balance",
DROP COLUMN "tacticStyle",
ADD COLUMN     "stadiumLevel" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "tactic" TEXT NOT NULL DEFAULT 'BALANCED',
ALTER COLUMN "budget" SET DEFAULT 150000000;
