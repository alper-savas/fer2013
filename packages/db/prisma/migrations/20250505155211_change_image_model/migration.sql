/*
  Warnings:

  - The `label` column on the `Image` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Label" AS ENUM ('ANGRY', 'DISGUST', 'FEAR', 'HAPPY', 'NEUTRAL', 'SAD', 'SURPRISE');

-- AlterTable
ALTER TABLE "Image" ALTER COLUMN "url" DROP NOT NULL,
DROP COLUMN "label",
ADD COLUMN     "label" "Label";
