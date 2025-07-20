import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT - Update reservation status (for Enseignant to confirm/cancel)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ENSEIGNANT") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const { id } = await params;
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
        id: id,
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
      where: { id: id },
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

// PATCH - Update reservation (for status TERMINEE, enseignant can set result)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const { id } = await params;
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
      
      // If enseignant accepts the candidate, update role to ETUDIANT immediately
      if (result === "ACCEPTER") {
        console.log("[PATCH /api/reservation/[id]] Enseignant accepted candidate, updating to ETUDIANT:", reservation.candidat.id, reservation.candidat.email);
        await prisma.user.update({ 
          where: { id: reservation.candidat.id }, 
          data: { role: "ETUDIANT" } 
        });
        console.log("[PATCH /api/reservation/[id]] User updated to ETUDIANT");
      }
      
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

// GET - Get reservation details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const reservation = await prisma.reservation.findUnique({
      where: { id },
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