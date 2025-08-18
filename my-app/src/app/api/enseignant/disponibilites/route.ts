import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Get disponibilites for the current enseignant
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ENSEIGNANT") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const now = new Date();
    const disponibilites = await prisma.disponibilite.findMany({
      where: {
        id_Enseignant: session.user.id,
        dateDebut: { gte: now }
      },
      orderBy: {
        dateDebut: 'asc'
      }
    });

    return NextResponse.json({ disponibilites });
  } catch (error) {
    console.error("Get enseignant disponibilites error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des disponibilités" },
      { status: 500 }
    );
  }
} 