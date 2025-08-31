import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notifyNewEvaluation } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ENSEIGNANT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const enseignantId = (session.user as any).id;
    const body = await request.json();
    const {
      interviewRequestId,
      francais,
      anglais,
      motivation,
      cultureGenerale,
      bonus,
      noteSur100,
      observation,
      competence,
    } = body;

    // Verify the interview request belongs to this enseignant
    const interviewRequest = await prisma.interviewRequest.findUnique({
      where: { id: interviewRequestId },
      include: { candidate: true }
    });

    if (!interviewRequest) {
      return NextResponse.json({ error: "Demande d'entretien non trouvée" }, { status: 404 });
    }

    if (interviewRequest.enseignantId !== enseignantId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Find or create the reservation for this interview request
    let reservation = await prisma.reservation.findFirst({
      where: {
        id_Candidat: interviewRequest.candidateId,
        disponibilite: {
          id_Enseignant: enseignantId
        }
      }
    });

    if (!reservation) {
      // Create a reservation if it doesn't exist
      const disponibilite = await prisma.disponibilite.findFirst({
        where: {
          id_Enseignant: enseignantId
        }
      });

      if (!disponibilite) {
        return NextResponse.json({ error: "Aucune disponibilité trouvée" }, { status: 404 });
      }

      reservation = await prisma.reservation.create({
        data: {
          id_Candidat: interviewRequest.candidateId,
          id_Disponibilite: disponibilite.id,
          status: "CONFIRMEE",
          result: "EN_ATTENTE"
        }
      });
    }

    // Upsert evaluation
    const evaluation = await prisma.interviewEvaluation.upsert({
      where: { reservationId: reservation.id },
      update: {
        francais: francais ? parseInt(francais) : null,
        anglais: anglais ? parseInt(anglais) : null,
        motivation: motivation ? parseInt(motivation) : null,
        cultureGenerale: cultureGenerale ? parseInt(cultureGenerale) : null,
        bonus: bonus ? parseInt(bonus) : null,
        noteSur100: noteSur100 ? parseInt(noteSur100) : null,
        observation: observation || null,
        competence: competence === "AUCUNE" ? null : competence,
      },
      create: {
        reservationId: reservation.id,
        enseignantId: enseignantId,
        candidatId: interviewRequest.candidateId,
        francais: francais ? parseInt(francais) : null,
        anglais: anglais ? parseInt(anglais) : null,
        motivation: motivation ? parseInt(motivation) : null,
        cultureGenerale: cultureGenerale ? parseInt(cultureGenerale) : null,
        bonus: bonus ? parseInt(bonus) : null,
        noteSur100: noteSur100 ? parseInt(noteSur100) : null,
        observation: observation || null,
        competence: competence === "AUCUNE" ? null : competence,
      },
    });

    // Notify admins about new evaluation
    try {
      const candidat = await prisma.user.findUnique({
        where: { id: interviewRequest.candidateId },
        select: { name: true, prenom: true, nom: true }
      });

      const enseignant = await prisma.user.findUnique({
        where: { id: enseignantId },
        select: { name: true, prenom: true, nom: true }
      });

      await notifyNewEvaluation({
        id: evaluation.id,
        candidatId: interviewRequest.candidateId,
        enseignantId: enseignantId,
        note: noteSur100 ? parseInt(noteSur100) : 0,
        commentaire: observation,
        candidatName: candidat?.prenom && candidat?.nom 
          ? `${candidat.prenom} ${candidat.nom}` 
          : candidat?.name || 'Candidat',
        enseignantName: enseignant?.prenom && enseignant?.nom 
          ? `${enseignant.prenom} ${enseignant.nom}` 
          : enseignant?.name || 'Enseignant',
      });
    } catch (notificationError) {
      console.error('Failed to send evaluation notification:', notificationError);
      // Don't fail the evaluation if notification fails
    }

    return NextResponse.json({ evaluation });
  } catch (error) {
    console.error("[POST /api/enseignant/evaluation] error:", error);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement de l'évaluation" }, { status: 500 });
  }
}
