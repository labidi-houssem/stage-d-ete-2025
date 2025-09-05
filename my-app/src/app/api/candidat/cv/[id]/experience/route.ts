import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST - Add experience entry
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const resolvedParams = await params;
    if (!session || session.user?.role !== "CANDIDAT") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    // Verify CV belongs to user
    const cv = await prisma.cv.findFirst({
      where: { 
        id: resolvedParams.id,
        candidatId: session.user.id 
      }
    });

    if (!cv) {
      return NextResponse.json(
        { error: "CV non trouvé" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      company,
      position,
      location,
      startDate,
      endDate,
      current,
      description,
      achievements
    } = body;

    const experience = await prisma.cvExperience.create({
      data: {
        cvId: resolvedParams.id,
        company,
        position,
        location,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        current: current || false,
        description,
        achievements: achievements || []
      }
    });

    return NextResponse.json({ experience });
  } catch (error) {
    console.error("Create experience error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout de l'expérience" },
      { status: 500 }
    );
  }
}
