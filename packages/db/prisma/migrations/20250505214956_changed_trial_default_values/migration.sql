/*
  Warnings:

  - Made the column `acceptedFalse` on table `Trial` required. This step will fail if there are existing NULL values in that column.
  - Made the column `acceptedTrue` on table `Trial` required. This step will fail if there are existing NULL values in that column.
  - Made the column `correctAnswers` on table `Trial` required. This step will fail if there are existing NULL values in that column.
  - Made the column `currentRound` on table `Trial` required. This step will fail if there are existing NULL values in that column.
  - Made the column `incorrectAnswers` on table `Trial` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rejectedFalse` on table `Trial` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rejectedTrue` on table `Trial` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Trial" ALTER COLUMN "acceptedFalse" SET NOT NULL,
ALTER COLUMN "acceptedFalse" SET DEFAULT 0,
ALTER COLUMN "acceptedTrue" SET NOT NULL,
ALTER COLUMN "acceptedTrue" SET DEFAULT 0,
ALTER COLUMN "correctAnswers" SET NOT NULL,
ALTER COLUMN "correctAnswers" SET DEFAULT 0,
ALTER COLUMN "currentRound" SET NOT NULL,
ALTER COLUMN "currentRound" SET DEFAULT 1,
ALTER COLUMN "incorrectAnswers" SET NOT NULL,
ALTER COLUMN "incorrectAnswers" SET DEFAULT 0,
ALTER COLUMN "rejectedFalse" SET NOT NULL,
ALTER COLUMN "rejectedFalse" SET DEFAULT 0,
ALTER COLUMN "rejectedTrue" SET NOT NULL,
ALTER COLUMN "rejectedTrue" SET DEFAULT 0;
