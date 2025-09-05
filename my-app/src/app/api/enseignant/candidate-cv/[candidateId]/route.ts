import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Get candidate's CV (for teachers during interviews)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const resolvedParams = await params;
    if (!session || !["ENSEIGNANT", "ADMIN"].includes(session.user?.role)) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    // For teachers, they can view any candidate CV (not just those with interviews)
    // For admins, they can view all candidate CVs
    // This allows teachers to review CVs before scheduling interviews

    // Get candidate's CV
    const cv = await prisma.cv.findUnique({
      where: { candidatId: resolvedParams.candidateId },
      include: {
        personalInfo: true,
        education: true,
        experience: true,
        skills: true,
        languages: true,
        projects: true,
        certifications: true
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
      where: { id: resolvedParams.candidateId },
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
