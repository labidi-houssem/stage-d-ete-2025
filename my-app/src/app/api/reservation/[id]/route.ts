import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendMail } from "@/lib/sendMail";
import { createMeetEvent } from '@/lib/googleMeet';

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
      },
      include: {
        candidat: true,
        disponibilite: {
          include: { enseignant: true }
        }
      }
    });

    if (!existingReservation) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    // For CONFIRMEE, add meetLink
    let updateData: any = { status };
    let meetLink = undefined;
    if (status === "CONFIRMEE") {
      try {
        meetLink = await createMeetEvent({
          summary: "Entretien de réservation",
          description: "Entretien entre enseignant et candidat.",
          start: existingReservation.disponibilite.dateDebut.toISOString(),
          end: existingReservation.disponibilite.dateFin.toISOString(),
          attendees: [
            { email: existingReservation.candidat.email },
            { email: existingReservation.disponibilite.enseignant.email }
          ]
        });
      } catch (e) {
        console.error("Failed to create Google Meet event:", e);
        meetLink = "https://meet.google.com/"; // fallback
      }
      updateData.meetLink = meetLink;
    }

    const reservation = await prisma.reservation.update({
      where: { id: id },
      data: updateData,
      include: {
        candidat: true,
        disponibilite: {
          include: { enseignant: true }
        }
      }
    });

    // Notification messages by status
    const statusMessages: Record<string, { candidat: string; enseignant: string }> = {
      EN_ATTENTE: {
        candidat: "Votre réservation est en attente de confirmation.",
        enseignant: "Une réservation est en attente de votre confirmation."
      },
      CONFIRMEE: {
        candidat: `Votre réservation a été confirmée. Lien Google Meet: ${meetLink}`,
        enseignant: `Vous avez confirmé une réservation. Lien Google Meet: ${meetLink}`
      },
      ANNULEE: {
        candidat: "Votre réservation a été annulée.",
        enseignant: "Une réservation a été annulée."
      },
      TERMINEE: {
        candidat: "Votre entretien a été terminé.",
        enseignant: "Vous avez terminé un entretien."
      }
    };

    // Notify candidat
    await prisma.notification.create({
      data: {
        userId: reservation.id_Candidat,
        type: `reservation_${status.toLowerCase()}`,
        message: statusMessages[status].candidat,
        link: meetLink || undefined,
      }
    });
    // Notify enseignant
    await prisma.notification.create({
      data: {
        userId: reservation.disponibilite.enseignant.id,
        type: `reservation_${status.toLowerCase()}`,
        message: statusMessages[status].enseignant,
        link: meetLink || undefined,
      }
    });

    // Send emails for CONFIRMEE
    if (status === "CONFIRMEE") {
      try {
        await sendMail({
          to: reservation.candidat.email,
          subject: 'Votre réservation a été confirmée',
          html: `<p>Bonjour ${reservation.candidat.prenom || reservation.candidat.name || ''},</p>
            <p>Votre réservation a été confirmée.</p>
            <p>Lien Google Meet: <a href="${meetLink}">${meetLink}</a></p>`
        });
        await sendMail({
          to: reservation.disponibilite.enseignant.email,
          subject: 'Vous avez confirmé une réservation',
          html: `<p>Bonjour ${reservation.disponibilite.enseignant.prenom || reservation.disponibilite.enseignant.name || ''},</p>
            <p>Vous avez confirmé une réservation.</p>
            <p>Lien Google Meet: <a href="${meetLink}">${meetLink}</a></p>`
        });
      } catch (e) {
        console.error('Erreur lors de l\'envoi de l\'email de confirmation:', e);
      }
    }

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