import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Get all available disponibilites for candidates
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const enseignantId = searchParams.get('enseignantId');
    const date = searchParams.get('date');

    let whereClause: any = {
      reservations: {
        none: {} // Only show disponibilites without reservations
      }
    };

    if (enseignantId) {
      whereClause.id_Enseignant = enseignantId;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.dateDebut = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    const disponibilites = await prisma.disponibilite.findMany({
      where: whereClause,
      include: {
        enseignant: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
          }
        }
      },
      orderBy: {
        dateDebut: 'asc'
      }
    });

    return NextResponse.json({ disponibilites });
  } catch (error) {
    console.error("Get available disponibilites error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des disponibilités" },
      { status: 500 }
    );
  }
}

// POST - Create new reservation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "CANDIDAT") {
      return NextResponse.json(
        { error: "Seuls les candidats peuvent réserver des entretiens" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id_Disponibilite } = body;

    if (!id_Disponibilite) {
      return NextResponse.json(
        { error: "ID de disponibilité requis" },
        { status: 400 }
      );
    }

    // Check if disponibilite exists and is available
    const disponibilite = await prisma.disponibilite.findFirst({
      where: {
        id: id_Disponibilite,
        reservations: {
          none: {}
        }
      }
    });

    if (!disponibilite) {
      return NextResponse.json(
        { error: "Cette disponibilité n'est plus disponible" },
        { status: 400 }
      );
    }

    // Check if candidate already has a reservation
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        id_Candidat: session.user.id,
        status: {
          in: ['EN_ATTENTE', 'CONFIRMEE']
        }
      }
    });

    if (existingReservation) {
      return NextResponse.json(
        { error: "Vous avez déjà une réservation en cours" },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.create({
      data: {
        id_Candidat: session.user.id,
        id_Disponibilite: id_Disponibilite,
        status: 'EN_ATTENTE'
      },
      include: {
        disponibilite: {
          include: {
            enseignant: {
              select: {
                nom: true,
                prenom: true,
                email: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(
      { 
        message: "Réservation créée avec succès",
        reservation 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create reservation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la réservation" },
      { status: 500 }
    );
  }
} 