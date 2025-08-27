import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST - Add skill
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "CANDIDAT") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const cv = await prisma.cv.findFirst({
      where: { 
        id: params.id,
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
    const { name, level, category } = body;

    const skill = await prisma.cvSkill.create({
      data: {
        cvId: params.id,
        name,
        level: level || 3,
        category: category || "Technical"
      }
    });

    return NextResponse.json({ skill });
  } catch (error) {
    console.error("Create skill error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout de la compétence" },
      { status: 500 }
    );
  }
}
