import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT - Update skill
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; skillId: string } }
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
    const { name, level, category } = body;

    const skill = await prisma.cvSkill.update({
      where: { id: params.skillId },
      data: {
        name,
        level: level || 3,
        category: category || "Technical"
      }
    });

    return NextResponse.json({ skill });
  } catch (error) {
    console.error("Update skill error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de la compétence" },
      { status: 500 }
    );
  }
}

// DELETE - Delete skill
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; skillId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "CANDIDAT") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    await prisma.cvSkill.delete({
      where: { id: params.skillId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete skill error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la compétence" },
      { status: 500 }
    );
  }
}
