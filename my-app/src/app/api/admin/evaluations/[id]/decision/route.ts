import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { decision } = await request.json();
    const evaluationId = params.id;

    if (!decision || !['ACCEPTED', 'REJECTED'].includes(decision)) {
      return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
    }

    // Find the evaluation with candidate information
    const evaluation = await prisma.interviewEvaluation.findUnique({
      where: { id: evaluationId },
      include: {
        candidat: true
      }
    });

    if (!evaluation) {
      return NextResponse.json({ error: "Evaluation not found" }, { status: 404 });
    }

    // Update the evaluation status
    await prisma.interviewEvaluation.update({
      where: { id: evaluationId },
      data: { status: decision }
    });

    // If accepted, convert candidate to student
    if (decision === 'ACCEPTED') {
      // Update user role to ETUDIANT
      await prisma.user.update({
        where: { id: evaluation.candidatId },
        data: { role: 'ETUDIANT' }
      });

      // Create notification for the candidate
      await prisma.notification.create({
        data: {
          userId: evaluation.candidatId,
          title: "Félicitations ! Vous êtes accepté(e)",
          message: `Votre candidature a été acceptée. Vous êtes maintenant étudiant(e) à ESPRIT. Note obtenue: ${evaluation.noteSur100}/100`,
          type: "SUCCESS",
          isRead: false
        }
      });
    } else if (decision === 'REJECTED') {
      // Create notification for the candidate
      await prisma.notification.create({
        data: {
          userId: evaluation.candidatId,
          title: "Candidature non retenue",
          message: `Nous regrettons de vous informer que votre candidature n'a pas été retenue cette fois-ci. Note obtenue: ${evaluation.noteSur100}/100`,
          type: "ERROR",
          isRead: false
        }
      });
    }

    return NextResponse.json({ 
      message: `Candidat ${decision === 'ACCEPTED' ? 'accepté' : 'refusé'} avec succès`,
      status: decision
    });

  } catch (error) {
    console.error("Error making decision:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
