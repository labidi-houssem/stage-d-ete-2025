-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ENSEIGNANT', 'CANDIDAT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'CANDIDAT';
