import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get all disponibilites for candidates (public access)
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const disponibilites = await prisma.disponibilite.findMany({
      where: {
        dateDebut: { gt: now }
      },
      include: {
        enseignant: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            specialite: true
          }
        },
        reservations: {
          select: {
            id: true,
            status: true,
            id_Candidat: true
          }
        }
      },
      orderBy: {
        dateDebut: 'asc'
      }
    });

    return NextResponse.json(disponibilites);
  } catch (error) {
    console.error("Get public disponibilites error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des disponibilités" },
      { status: 500 }
    );
  }
} 