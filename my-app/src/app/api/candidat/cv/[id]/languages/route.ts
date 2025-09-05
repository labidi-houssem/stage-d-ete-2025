import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST - Add language
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
    const { name, level } = body;

    const language = await prisma.cvLanguage.create({
      data: {
        cvId: resolvedParams.id,
        name,
        level: level || "Intermediate"
      }
    });

    return NextResponse.json({ language });
  } catch (error) {
    console.error("Create language error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout de la langue" },
      { status: 500 }
    );
  }
}
