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
    const mine = searchParams.get('mine');
    // If mine=1 and user is candidate, return all their reservations
    if (mine === '1' && session.user.role === 'CANDIDAT') {
      const reservations = await prisma.reservation.findMany({
        where: { id_Candidat: session.user.id },
        include: {
          disponibilite: {
            include: { enseignant: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ reservations });
    }

    let whereClause: any = {
      OR: [
        { reservations: { none: {} } }, // No reservations
        { reservations: { every: { status: "ANNULEE" } } } // Only cancelled reservations
      ]
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
    const { dateTime } = body;
    if (!dateTime) {
      return NextResponse.json(
        { error: "Date et heure requises" },
        { status: 400 }
      );
    }
    // Block if candidate has a reservation with status TERMINEE
    const hasTerminee = await prisma.reservation.findFirst({
      where: {
        id_Candidat: session.user.id,
        status: "TERMINEE"
      }
    });
    if (hasTerminee) {
      return NextResponse.json(
        { error: "Vous avez déjà terminé un entretien. Vous ne pouvez plus réserver." },
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
    // Find all available disponibilites for the requested slot
    const date = new Date(dateTime);
    const disponibilites = await prisma.disponibilite.findMany({
      where: {
        dateDebut: { lte: date },
        dateFin: { gt: date },
        OR: [
          { reservations: { none: {} } },
          { reservations: { every: { status: "ANNULEE" } } }
        ]
      },
      include: {
        enseignant: true
      }
    });
    if (disponibilites.length === 0) {
      return NextResponse.json(
        { error: "Aucun enseignant n'est disponible à ce créneau" },
        { status: 400 }
      );
    }
    // For each disponibilite, count the number of active reservations for the enseignant
    const enseignantCounts = await Promise.all(
      disponibilites.map(async (dispo) => {
        const count = await prisma.reservation.count({
          where: {
            disponibilite: { enseignant: { id: dispo.id_Enseignant } },
            status: { in: ['EN_ATTENTE', 'CONFIRMEE'] }
          }
        });
        return { dispo, count };
      })
    );
    // Pick the disponibilite with the enseignant with the least reservations
    enseignantCounts.sort((a, b) => a.count - b.count);
    const chosenDispo = enseignantCounts[0].dispo;
    // Create the reservation
    const reservation = await prisma.reservation.create({
      data: {
        id_Candidat: session.user.id,
        id_Disponibilite: chosenDispo.id,
        status: 'EN_ATTENTE'
      },
      include: {
        disponibilite: {
          include: {
            enseignant: true
          }
        }
      }
    });
    return NextResponse.json(
      {
        message: "Réservation créée avec succès",
        reservation,
        enseignant: reservation.disponibilite.enseignant
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

// PATCH - Update reservation (for status TERMINEE, enseignant can set result)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const { id } = params;
    const body = await request.json();
    const { status, result } = body;

    // Find the reservation with enseignant info
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { 
        candidat: true,
        disponibilite: {
          include: {
            enseignant: true
          }
        }
      }
    });

    if (!reservation) {
      return NextResponse.json({ error: "Réservation non trouvée" }, { status: 404 });
    }

    // Check if user is the enseignant or the candidate
    const isEnseignant = reservation.disponibilite.enseignant.id === session.user.id;
    const isCandidat = reservation.id_Candidat === session.user.id;

    if (!isEnseignant && !isCandidat) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // If enseignant is updating status to TERMINEE, they can set the result
    if (isEnseignant && status === "TERMINEE") {
      if (!result || (result !== "ACCEPTER" && result !== "REFUSER")) {
        return NextResponse.json({ error: "Résultat requis: ACCEPTER ou REFUSER" }, { status: 400 });
      }

      const updated = await prisma.reservation.update({
        where: { id },
        data: { status, result },
      });

      console.log(`[PATCH /api/reservation/[id]] Enseignant set result: ${result} for candidate: ${reservation.candidat.email}`);
      return NextResponse.json({ reservation: updated });
    }

    // If candidate is accepting the result
    if (isCandidat && result === "ACCEPTER" && reservation.status === "TERMINEE") {
      if (reservation.result !== "ACCEPTER") {
        return NextResponse.json({ error: "Résultat non accepté par l'enseignant" }, { status: 400 });
      }

      const updated = await prisma.reservation.update({
        where: { id },
        data: { result: "ACCEPTER" },
      });

      // Update user role to ETUDIANT when candidate accepts
      console.log("[PATCH /api/reservation/[id]] Candidate accepting result, updating to ETUDIANT:", reservation.candidat.id, reservation.candidat.email);
      await prisma.user.update({ 
        where: { id: reservation.candidat.id }, 
        data: { role: "ETUDIANT" } 
      });
      console.log("[PATCH /api/reservation/[id]] User updated to ETUDIANT");

      return NextResponse.json({ reservation: updated });
    }

    // For other updates (like cancellation), only allow the candidate
    if (!isCandidat) {
      return NextResponse.json({ error: "Seul le candidat peut modifier cette réservation" }, { status: 403 });
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ reservation: updated });
  } catch (error) {
    console.error("[PATCH /api/reservation/[id]] Error:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
} 