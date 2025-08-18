import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  // Find all enseignants and their available slots
  const enseignants = await prisma.user.findMany({
    where: { role: "ENSEIGNANT" },
    select: {
      id: true,
      name: true,
      email: true,
      disponibilites: {
        where: {
          OR: [
            { reservations: { none: {} } },
            { reservations: { every: { status: "ANNULEE" } } },
          ],
        },
        select: {
          id: true,
          dateDebut: true,
          dateFin: true,
        },
        orderBy: { dateDebut: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ enseignants });
} 