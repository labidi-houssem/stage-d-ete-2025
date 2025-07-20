/*
  Warnings:

  - You are about to drop the `Etudiant` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'ETUDIANT';

-- DropTable
DROP TABLE "Etudiant";
