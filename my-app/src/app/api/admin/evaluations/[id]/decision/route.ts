import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type DecisionType = 'ACCEPTED' | 'REJECTED';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { decision } = await request.json();
    const { id: evaluationId } = await params;

    if (!decision || !['ACCEPTED', 'REJECTED'].includes(decision)) {
      return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
    }

    const typedDecision = decision as DecisionType;

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
      data: { status: typedDecision }
    });

    // If accepted, convert candidate to student
    if (typedDecision === 'ACCEPTED') {
      // Update user role to ETUDIANT
      await prisma.user.update({
        where: { id: evaluation.candidatId },
        data: { role: 'ETUDIANT' }
      });

      // Create notification for the candidate
      await prisma.notification.create({
        data: {
          userId: evaluation.candidatId,
          message: `Félicitations ! Vous êtes accepté(e). Votre candidature a été acceptée. Vous êtes maintenant étudiant(e) à ESPRIT. Note obtenue: ${evaluation.noteSur100}/100`,
          type: "SUCCESS",
          read: false
        }
      });
    } else if (typedDecision === 'REJECTED') {
      // Create notification for the candidate
      await prisma.notification.create({
        data: {
          userId: evaluation.candidatId,
          message: `Candidature non retenue. Nous regrettons de vous informer que votre candidature n'a pas été retenue cette fois-ci. Note obtenue: ${evaluation.noteSur100}/100`,
          type: "ERROR",
          read: false
        }
      });
    }

    return NextResponse.json({ 
      message: `Candidat ${typedDecision === 'ACCEPTED' ? 'accepté' : 'refusé'} avec succès`,
      status: typedDecision
    });

  } catch (error) {
    console.error("Error making decision:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
