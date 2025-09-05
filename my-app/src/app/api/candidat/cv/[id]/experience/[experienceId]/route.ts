import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT - Update experience entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; experienceId: string }> }
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

    const experience = await prisma.cvExperience.update({
      where: { id: resolvedParams.experienceId },
      data: {
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
    console.error("Update experience error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de l'expérience" },
      { status: 500 }
    );
  }
}

// DELETE - Delete experience entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; experienceId: string }> }
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

    await prisma.cvExperience.delete({
      where: { id: resolvedParams.experienceId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete experience error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'expérience" },
      { status: 500 }
    );
  }
}
