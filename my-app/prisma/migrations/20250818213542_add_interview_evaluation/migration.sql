-- CreateEnum
CREATE TYPE "Competence" AS ENUM ('CULTURE', 'ART', 'EXPERIENCE_ONG', 'SPORT', 'AUCUNE');

-- CreateTable
CREATE TABLE "InterviewEvaluation" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "enseignantId" TEXT NOT NULL,
    "candidatId" TEXT NOT NULL,
    "francais" INTEGER,
    "anglais" INTEGER,
    "motivation" INTEGER,
    "cultureGenerale" INTEGER,
    "bonus" INTEGER,
    "noteSur100" INTEGER,
    "observation" TEXT,
    "competence" "Competence",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InterviewEvaluation_reservationId_key" ON "InterviewEvaluation"("reservationId");

-- AddForeignKey
ALTER TABLE "InterviewEvaluation" ADD CONSTRAINT "InterviewEvaluation_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewEvaluation" ADD CONSTRAINT "InterviewEvaluation_enseignantId_fkey" FOREIGN KEY ("enseignantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewEvaluation" ADD CONSTRAINT "InterviewEvaluation_candidatId_fkey" FOREIGN KEY ("candidatId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
