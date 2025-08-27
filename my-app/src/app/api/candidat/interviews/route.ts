import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Get candidate's interviews
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "CANDIDAT") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const interviews = await prisma.reservation.findMany({
      where: { id_Candidat: session.user.id },
      include: {
        disponibilite: {
          include: {
            enseignant: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        disponibilite: {
          dateDebut: 'asc'
        }
      }
    });

    return NextResponse.json({ interviews });
  } catch (error) {
    console.error("Get interviews error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des entretiens" },
      { status: 500 }
    );
  }
}
