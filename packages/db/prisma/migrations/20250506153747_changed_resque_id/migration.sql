/*
  Warnings:

  - The primary key for the `ResQue` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "ResQue" DROP CONSTRAINT "ResQue_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ResQue_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ResQue_id_seq";
