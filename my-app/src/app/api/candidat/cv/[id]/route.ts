import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Get specific CV by ID
export async function GET(
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
      },
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
        { error: "CV non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ cv });
  } catch (error) {
    console.error("Get CV by ID error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du CV" },
      { status: 500 }
    );
  }
}

// PUT - Update CV basic info
export async function PUT(
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

    const body = await request.json();
    const { title, template, isPublic } = body;

    const cv = await prisma.cv.updateMany({
      where: { 
        id: params.id,
        candidatId: session.user.id 
      },
      data: {
        title,
        template,
        isPublic
      }
    });

    if (cv.count === 0) {
      return NextResponse.json(
        { error: "CV non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update CV error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du CV" },
      { status: 500 }
    );
  }
}

// DELETE - Delete CV
export async function DELETE(
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

    const cv = await prisma.cv.deleteMany({
      where: { 
        id: params.id,
        candidatId: session.user.id 
      }
    });

    if (cv.count === 0) {
      return NextResponse.json(
        { error: "CV non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete CV error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du CV" },
      { status: 500 }
    );
  }
}
