import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendMail } from "@/lib/sendMail";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ENSEIGNANT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { requestId, candidateId, dateTime, meetingLink } = await request.json();
    if (!requestId || !candidateId || !dateTime || !meetingLink) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const enseignantId = (session.user as any).id;

    // Get the interview request
    const interviewRequest = await prisma.interviewRequest.findUnique({
      where: { id: requestId },
      include: {
        candidate: true,
        enseignant: true
      }
    });

    if (!interviewRequest) {
      return NextResponse.json({ error: "Demande d'entretien non trouvée" }, { status: 404 });
    }

    if (interviewRequest.enseignantId !== enseignantId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    if (interviewRequest.status !== "PENDING") {
      return NextResponse.json({ error: "Cette demande n'est plus en attente" }, { status: 400 });
    }

    // Create a disponibilite for this specific interview
    const disponibilite = await prisma.disponibilite.create({
      data: {
        id_Enseignant: enseignantId,
        dateDebut: new Date(dateTime),
        dateFin: new Date(new Date(dateTime).getTime() + 60 * 60 * 1000), // 1 hour duration
      }
    });

    // Create a reservation
    const reservation = await prisma.reservation.create({
      data: {
        id_Candidat: candidateId,
        id_Disponibilite: disponibilite.id,
        status: "CONFIRMEE",
        meetLink: meetingLink,
      },
      include: {
        candidat: true,
        disponibilite: { include: { enseignant: true } }
      }
    });

    // Update interview request status
    await prisma.interviewRequest.update({
      where: { id: requestId },
      data: {
        status: "ACCEPTED",
        dateEntretien: new Date(dateTime),
        meetLink: meetingLink
      }
    });

    // Send notification to candidate
    await prisma.notification.create({
      data: {
        userId: candidateId,
        type: "interview_confirmed",
        message: `Votre entretien a été confirmé pour le ${new Date(dateTime).toLocaleString("fr-FR")}. Lien de réunion: ${meetingLink}`,
        link: meetingLink,
      }
    });

    // Send email to candidate
    try {
      await sendMail({
        to: interviewRequest.candidate.email,
        subject: "Votre entretien a été confirmé",
        html: `
          <p>Bonjour ${interviewRequest.candidate.name || "Candidat"},</p>
          <p>Votre entretien a été confirmé pour le <strong>${new Date(dateTime).toLocaleString("fr-FR")}</strong>.</p>
          <p>Lien de réunion : <a href="${meetingLink}">${meetingLink}</a></p>
          <p>Préparez-vous bien et à bientôt !</p>
        `
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({ 
      message: "Entretien confirmé avec succès",
      reservation: {
        id: reservation.id,
        dateEntretien: new Date(dateTime),
        meetLink: reservation.meetLink,
        status: reservation.status
      }
    });

  } catch (error) {
    console.error("Error accepting interview:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
} 