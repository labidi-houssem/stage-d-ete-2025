import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Get all disponibilites for a teacher
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ENSEIGNANT") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const enseignantId = searchParams.get('enseignantId') || session.user.id;

    const disponibilites = await prisma.disponibilite.findMany({
      where: {
        id_Enseignant: enseignantId
      },
      include: {
        reservations: {
          include: {
            candidat: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
                specialite: true
              }
            }
          }
        }
      },
      orderBy: {
        dateDebut: 'asc'
      }
    });

    return NextResponse.json({ disponibilites });
  } catch (error) {
    console.error("Get disponibilites error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des disponibilités" },
      { status: 500 }
    );
  }
}

// POST - Create new disponibilite
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ENSEIGNANT") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { dateDebut, dateFin } = body;

    if (!dateDebut || !dateFin) {
      return NextResponse.json(
        { error: "Date de début et date de fin sont requises" },
        { status: 400 }
      );
    }

    const disponibilite = await prisma.disponibilite.create({
      data: {
        id_Enseignant: session.user.id,
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin)
      }
    });

    return NextResponse.json(
      { 
        message: "Disponibilité créée avec succès",
        disponibilite 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create disponibilite error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la disponibilité" },
      { status: 500 }
    );
  }
} 