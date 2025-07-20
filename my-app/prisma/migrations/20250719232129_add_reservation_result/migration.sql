-- CreateEnum
CREATE TYPE "ReservationResult" AS ENUM ('EN_ATTENTE', 'ACCEPTER', 'REFUSER');

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "result" "ReservationResult" NOT NULL DEFAULT 'EN_ATTENTE';
