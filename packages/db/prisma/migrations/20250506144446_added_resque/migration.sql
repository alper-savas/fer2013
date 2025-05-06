-- CreateTable
CREATE TABLE "ResQue" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "items" JSONB NOT NULL DEFAULT '[]',
    "trialId" TEXT NOT NULL,

    CONSTRAINT "ResQue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResQue_trialId_key" ON "ResQue"("trialId");

-- AddForeignKey
ALTER TABLE "ResQue" ADD CONSTRAINT "ResQue_trialId_fkey" FOREIGN KEY ("trialId") REFERENCES "Trial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
