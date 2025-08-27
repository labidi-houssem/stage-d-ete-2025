import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST - Add project
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
    const {
      name,
      description,
      technologies,
      url,
      githubUrl,
      startDate,
      endDate
    } = body;

    const project = await prisma.cvProject.create({
      data: {
        cvId: params.id,
        name,
        description,
        technologies: technologies || [],
        url,
        githubUrl,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout du projet" },
      { status: 500 }
    );
  }
}
