import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT - Update reservation status (for Enseignant to confirm/cancel)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ENSEIGNANT") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["EN_ATTENTE", "CONFIRMEE", "ANNULEE", "TERMINEE"].includes(status)) {
      return NextResponse.json(
        { error: "Statut invalide" },
        { status: 400 }
      );
    }

    // Check if reservation exists and belongs to the teacher's disponibilite
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        id: params.id,
        disponibilite: {
          id_Enseignant: session.user.id
        }
      }
    });

    if (!existingReservation) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    const reservation = await prisma.reservation.update({
      where: { id: params.id },
      data: { status },
      include: {
        candidat: {
          select: {
            nom: true,
            prenom: true,
            email: true,
            specialite: true
          }
        },
        disponibilite: {
          select: {
            dateDebut: true,
            dateFin: true
          }
        }
      }
    });

    return NextResponse.json(
      { 
        message: "Statut de réservation mis à jour avec succès",
        reservation 
      }
    );
  } catch (error) {
    console.error("Update reservation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la réservation" },
      { status: 500 }
    );
  }
}

// GET - Get reservation details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: {
        candidat: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            specialite: true,
            telephone: true
          }
        },
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
      }
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    // Check if user has access to this reservation
    if (session.user?.role === "CANDIDAT" && reservation.id_Candidat !== session.user.id) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    if (session.user?.role === "ENSEIGNANT" && reservation.disponibilite.id_Enseignant !== session.user.id) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    return NextResponse.json({ reservation });
  } catch (error) {
    console.error("Get reservation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la réservation" },
      { status: 500 }
    );
  }
} 