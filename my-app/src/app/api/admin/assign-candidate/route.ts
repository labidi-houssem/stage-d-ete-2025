import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/sendMail";

export async function POST(request: NextRequest) {
  const { candidateId, slotId } = await request.json();
  if (!candidateId || !slotId) {
    return NextResponse.json({ error: "Missing candidateId or slotId" }, { status: 400 });
  }

  // Check if slot is still available
  const slot = await prisma.disponibilite.findUnique({
    where: { id: slotId },
    include: { reservations: true, enseignant: true },
  });
  if (!slot) {
    return NextResponse.json({ error: "Créneau non trouvé" }, { status: 404 });
  }
  const isAvailable = !slot.reservations.length || slot.reservations.every(r => r.status === "ANNULEE");
  if (!isAvailable) {
    return NextResponse.json({ error: "Ce créneau n'est plus disponible." }, { status: 409 });
  }

  // Create the reservation
  const reservation = await prisma.reservation.create({
    data: {
      id_Candidat: candidateId,
      id_Disponibilite: slotId,
      status: "EN_ATTENTE",
    },
    include: {
      candidat: true,
      disponibilite: { include: { enseignant: true } },
    },
  });

  // Notifications
  await prisma.notification.create({
    data: {
      userId: reservation.id_Candidat,
      type: "assignment",
      message: `Vous avez été assigné à un entretien le ${new Date(slot.dateDebut).toLocaleString("fr-FR")} avec ${slot.enseignant?.name || "l'enseignant"}.`,
      link: "/calendar/candidate",
    },
  });
  await prisma.notification.create({
    data: {
      userId: slot.enseignant.id,
      type: "assignment",
      message: `Un candidat (${reservation.candidat.name || reservation.candidat.email}) a été assigné à votre créneau du ${new Date(slot.dateDebut).toLocaleString("fr-FR")}.`,
      link: "/calendar/manage",
    },
  });

  // Emails
  try {
    await sendMail({
      to: reservation.candidat.email,
      subject: "Vous avez été assigné à un entretien",
      html: `<p>Bonjour ${reservation.candidat.name || "Candidat"},</p>
        <p>Vous avez été assigné à un entretien le <b>${new Date(slot.dateDebut).toLocaleString("fr-FR")}</b> avec ${slot.enseignant?.name || "l'enseignant"}.</p>
        <p>Consultez votre espace pour plus de détails.</p>`
    });
    await sendMail({
      to: slot.enseignant.email,
      subject: "Un candidat a été assigné à votre créneau",
      html: `<p>Bonjour ${slot.enseignant.name || "Enseignant"},</p>
        <p>Un candidat (${reservation.candidat.name || reservation.candidat.email}) a été assigné à votre créneau du <b>${new Date(slot.dateDebut).toLocaleString("fr-FR")}</b>.</p>
        <p>Consultez votre espace pour plus de détails.</p>`
    });
  } catch (e) {
    // Ignore email errors for now
  }

  return NextResponse.json({ reservation });
} 