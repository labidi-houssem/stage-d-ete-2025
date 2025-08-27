import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Get candidate's CV (for teachers during interviews)
export async function GET(
  request: NextRequest,
  { params }: { params: { candidateId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ENSEIGNANT") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    // Verify that the teacher has an interview with this candidate
    const hasInterview = await prisma.reservation.findFirst({
      where: {
        id_Candidat: params.candidateId,
        disponibilite: {
          id_Enseignant: session.user.id
        },
        status: {
          in: ["EN_ATTENTE", "CONFIRMEE", "TERMINEE"]
        }
      }
    });

    if (!hasInterview) {
      return NextResponse.json(
        { error: "Vous n'avez pas d'entretien avec ce candidat" },
        { status: 403 }
      );
    }

    // Get candidate's CV
    const cv = await prisma.cv.findUnique({
      where: { candidatId: params.candidateId },
      include: {
        personalInfo: true,
        education: { orderBy: { order: 'asc' } },
        experience: { orderBy: { order: 'asc' } },
        skills: { orderBy: { order: 'asc' } },
        languages: { orderBy: { order: 'asc' } },
        projects: { orderBy: { order: 'asc' } },
        certifications: { orderBy: { order: 'asc' } }
      }
    });

    if (!cv) {
      return NextResponse.json(
        { error: "Ce candidat n'a pas encore créé de CV" },
        { status: 404 }
      );
    }

    // Get candidate basic info
    const candidate = await prisma.user.findUnique({
      where: { id: params.candidateId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        specialite: true,
        telephone: true
      }
    });

    return NextResponse.json({ 
      cv,
      candidate 
    });
  } catch (error) {
    console.error("Get candidate CV error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du CV" },
      { status: 500 }
    );
  }
}
