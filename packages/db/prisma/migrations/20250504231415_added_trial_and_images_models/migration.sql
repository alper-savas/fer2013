-- CreateEnum
CREATE TYPE "AutomationLevel" AS ENUM ('LOA1', 'LOA2', 'LOA3', 'LOA4_5', 'LOA6');

-- AlterTable
ALTER TABLE "Trial" ADD COLUMN     "acceptedFalse" INTEGER,
ADD COLUMN     "acceptedTrue" INTEGER,
ADD COLUMN     "automationLevel" "AutomationLevel" NOT NULL DEFAULT 'LOA1',
ADD COLUMN     "correctAnswers" INTEGER,
ADD COLUMN     "currentRound" INTEGER,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "finishedAt" TIMESTAMP(3),
ADD COLUMN     "incorrectAnswers" INTEGER,
ADD COLUMN     "rejectedFalse" INTEGER,
ADD COLUMN     "rejectedTrue" INTEGER;

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "url" TEXT NOT NULL,
    "emotion" TEXT NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Image_url_key" ON "Image"("url");
