import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT - Update education entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; educationId: string }> }
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
      institution,
      degree,
      fieldOfStudy,
      startDate,
      endDate,
      current,
      grade,
      description
    } = body;

    const education = await prisma.cvEducation.update({
      where: { id: resolvedParams.educationId },
      data: {
        institution,
        degree,
        fieldOfStudy,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        current: current || false,
        grade,
        description
      }
    });

    return NextResponse.json({ education });
  } catch (error) {
    console.error("Update education error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de la formation" },
      { status: 500 }
    );
  }
}

// DELETE - Delete education entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; educationId: string }> }
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

    await prisma.cvEducation.delete({
      where: { id: resolvedParams.educationId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete education error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la formation" },
      { status: 500 }
    );
  }
}
