import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT - Update language
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; languageId: string } }
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
    const { name, level } = body;

    const language = await prisma.cvLanguage.update({
      where: { id: params.languageId },
      data: {
        name,
        level: level || "Intermediate"
      }
    });

    return NextResponse.json({ language });
  } catch (error) {
    console.error("Update language error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de la langue" },
      { status: 500 }
    );
  }
}

// DELETE - Delete language
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; languageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "CANDIDAT") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    await prisma.cvLanguage.delete({
      where: { id: params.languageId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete language error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la langue" },
      { status: 500 }
    );
  }
}
