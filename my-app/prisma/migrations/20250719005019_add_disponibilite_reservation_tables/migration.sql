-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('EN_ATTENTE', 'CONFIRMEE', 'ANNULEE', 'TERMINEE');

-- CreateTable
CREATE TABLE "Disponibilite" (
    "id" TEXT NOT NULL,
    "id_Enseignant" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Disponibilite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "id_Candidat" TEXT NOT NULL,
    "id_Disponibilite" TEXT NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Disponibilite" ADD CONSTRAINT "Disponibilite_id_Enseignant_fkey" FOREIGN KEY ("id_Enseignant") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_id_Candidat_fkey" FOREIGN KEY ("id_Candidat") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_id_Disponibilite_fkey" FOREIGN KEY ("id_Disponibilite") REFERENCES "Disponibilite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
