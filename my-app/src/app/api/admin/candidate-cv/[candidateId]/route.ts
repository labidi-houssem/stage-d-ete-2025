import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Get candidate's CV (for admins)
export async function GET(
  request: NextRequest,
  { params }: { params: { candidateId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    // Admins can view any candidate CV
    const cv = await prisma.cv.findUnique({
      where: { candidatId: params.candidateId },
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
      where: { id: params.candidateId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        specialite: true,
        telephone: true,
        createdAt: true
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
