import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendMail } from '@/lib/sendMail';
import { notifyReservationCreated } from '@/lib/notifications';

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
    const user = session?.user as any; // Fix typing for user
    if (!session || user?.role !== "CANDIDAT") {
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
        id_Candidat: user.id,
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
        id_Candidat: user.id,
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
        id_Candidat: user.id,
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

    // Create a notification for the enseignant
    await prisma.notification.create({
      data: {
        userId: chosenDispo.id_Enseignant,
        type: 'reservation',
        message: `Nouvelle réservation pour le ${reservation.disponibilite.dateDebut.toLocaleString('fr-FR')}`,
        link: '/calendar/reservations',
      }
    });

    // Create a notification for the candidate
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'reservation_created',
        message: `Votre réservation a été créée et est en attente de confirmation pour le ${reservation.disponibilite.dateDebut.toLocaleString('fr-FR')}`,
        link: '/calendar/candidate',
      }
    });

    // Send email to enseignant
    try {
      await sendMail({
        to: reservation.disponibilite.enseignant.email,
        subject: 'Nouvelle réservation d\'entretien',
        html: `<p>Bonjour ${reservation.disponibilite.enseignant.prenom},</p>
          <p>Vous avez une nouvelle réservation d'entretien pour le <b>${new Date(reservation.disponibilite.dateDebut).toLocaleString('fr-FR')}</b>.</p>
          <p>Consultez votre tableau de bord pour plus de détails.</p>`
      });
    } catch (e) {
      console.error('Erreur lors de l\'envoi de l\'email de notification:', e);
    }

    // Notify admins about new reservation
    try {
      const candidat = await prisma.user.findUnique({
        where: { id: user.id },
        select: { name: true, prenom: true, nom: true }
      });

      await notifyReservationCreated({
        id: reservation.id,
        candidatId: user.id,
        enseignantId: chosenDispo.id_Enseignant,
        candidatName: candidat?.prenom && candidat?.nom 
          ? `${candidat.prenom} ${candidat.nom}` 
          : candidat?.name || 'Candidat',
        enseignantName: reservation.disponibilite.enseignant.prenom && reservation.disponibilite.enseignant.nom 
          ? `${reservation.disponibilite.enseignant.prenom} ${reservation.disponibilite.enseignant.nom}` 
          : reservation.disponibilite.enseignant.name || 'Enseignant',
        dateDebut: reservation.disponibilite.dateDebut,
        dateFin: reservation.disponibilite.dateFin,
      });
    } catch (notificationError) {
      console.error('Failed to send reservation notification:', notificationError);
      // Don't fail the reservation if notification fails
    }

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
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log('[PATCH] Handler called');
    const session = await getServerSession(authOptions);
    const resolvedParams = await params;
    if (!session) {
      console.log('[PATCH] No session');
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const { id } = resolvedParams;
    const body = await request.json();
    console.log('[PATCH] Request body:', body);
    const { status, result } = body;
    console.log('[PATCH] session.user:', session.user);

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
    console.log('[PATCH] Reservation found:', reservation);

    if (!reservation) {
      console.log('[PATCH] Reservation not found');
      return NextResponse.json({ error: "Réservation non trouvée" }, { status: 404 });
    }

    // Check if user is the enseignant or the candidate
    const isEnseignant = reservation.disponibilite.enseignant.id === session.user.id;
    const isCandidat = reservation.id_Candidat === session.user.id;
    console.log('[PATCH] status:', status, 'isEnseignant:', isEnseignant, 'isCandidat:', isCandidat, 'session.user.id:', session.user.id);

    if (!isEnseignant && !isCandidat) {
      console.log('[PATCH] Not authorized');
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

      // Notify candidate of result
      await prisma.notification.create({
        data: {
          userId: reservation.id_Candidat,
          type: 'reservation_result',
          message: `Votre entretien a été terminé. Résultat: ${result === 'ACCEPTER' ? 'Accepté' : 'Refusé'}.`,
          link: '/calendar/candidate',
        }
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

    // If enseignant is confirming the reservation
    if (isEnseignant && status === "CONFIRMEE") {
      console.log('[PATCH] Enseignant is confirming reservation');
      // Generate or set the Google Meet link (placeholder for now)
      const meetLink = "https://meet.google.com/your-meeting-link";
      const updated = await prisma.reservation.update({
        where: { id },
        data: { status, meetLink },
        include: {
          candidat: true,
          disponibilite: { include: { enseignant: true } }
        }
      });
      console.log('[PATCH] Reservation updated:', updated);

      // Notify candidat in-app
      const notifCandidat = await prisma.notification.create({
        data: {
          userId: updated.id_Candidat,
          type: 'reservation_confirmed',
          message: `Votre réservation a été confirmée. Lien Google Meet: ${meetLink}`,
          link: meetLink,
        }
      });
      console.log('[NOTIF] Notification sent to candidat:', notifCandidat);

      // Notify enseignant in-app
      const notifEnseignant = await prisma.notification.create({
        data: {
          userId: updated.disponibilite.enseignant.id,
          type: 'reservation_confirmed',
          message: `Vous avez confirmé une réservation. Lien Google Meet: ${meetLink}`,
          link: meetLink,
        }
      });
      console.log('[NOTIF] Notification sent to enseignant:', notifEnseignant);

      // Send emails to both users
      try {
        await sendMail({
          to: updated.candidat.email,
          subject: 'Votre réservation a été confirmée',
          html: `<p>Bonjour ${updated.candidat.prenom || updated.candidat.name || ''},</p>
            <p>Votre réservation a été confirmée.</p>
            <p>Lien Google Meet: <a href="${meetLink}">${meetLink}</a></p>`
        });
        await sendMail({
          to: updated.disponibilite.enseignant.email,
          subject: 'Vous avez confirmé une réservation',
          html: `<p>Bonjour ${updated.disponibilite.enseignant.prenom || updated.disponibilite.enseignant.name || ''},</p>
            <p>Vous avez confirmé une réservation.</p>
            <p>Lien Google Meet: <a href="${meetLink}">${meetLink}</a></p>`
        });
        console.log('[MAIL] Emails sent to both users');
      } catch (e) {
        console.error('Erreur lors de l\'envoi de l\'email de confirmation:', e);
      }

      return NextResponse.json({ reservation: updated });
    }

    // Fallback: log and create a debug notification if CONFIRMEE block is not hit
    if (isEnseignant && status) {
      console.log('[DEBUG] PATCH called by enseignant with status:', status);
      await prisma.notification.create({
        data: {
          userId: reservation.disponibilite.enseignant.id,
          type: 'debug_patch_status',
          message: `DEBUG: PATCH called with status: ${status}`,
          link: '/calendar/reservations',
        }
      });
    }

    // For other updates (like cancellation), only allow the candidate
    if (!isCandidat) {
      return NextResponse.json({ error: "Seul le candidat peut modifier cette réservation" }, { status: 403 });
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: { status },
    });

    // Notify candidate of status change (except when candidate cancels)
    if (isCandidat) {
      await prisma.notification.create({
        data: {
          userId: reservation.id_Candidat,
          type: 'reservation_status',
          message: `Le statut de votre réservation a changé: ${status}.`,
          link: '/calendar/candidate',
        }
      });
      // Notify enseignant of candidate's action (cancellation or change)
      await prisma.notification.create({
        data: {
          userId: reservation.disponibilite.enseignant.id,
          type: 'reservation_status',
          message: `Le candidat a ${status === 'ANNULEE' ? 'annulé' : 'modifié'} la réservation.`,
          link: '/calendar/reservations',
        }
      });
    }

    return NextResponse.json({ reservation: updated });
  } catch (error) {
    console.error("[PATCH /api/reservation/[id]] Error:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
} 