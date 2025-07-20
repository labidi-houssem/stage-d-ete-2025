-- CreateTable
CREATE TABLE "Etudiant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nom" TEXT,
    "prenom" TEXT,
    "telephone" TEXT,
    "dateNaissance" TIMESTAMP(3),
    "specialite" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Etudiant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Etudiant_userId_key" ON "Etudiant"("userId");
