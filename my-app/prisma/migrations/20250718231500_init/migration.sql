-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cin" TEXT,
    "nom" TEXT,
    "prenom" TEXT,
    "telephone" TEXT,
    "dateDelivrance" TIMESTAMP(3),
    "lieuDelivrance" TEXT,
    "address" TEXT,
    "nationalite" TEXT,
    "civilite" TEXT,
    "dateNaissance" TIMESTAMP(3),
    "gouvernorat" TEXT,
    "specialite" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_cin_key" ON "User"("cin");
