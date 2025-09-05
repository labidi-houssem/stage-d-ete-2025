import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT - Update certification
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; certificationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "CANDIDAT") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const body = await request.json();
    const {
      name,
      issuer,
      issueDate,
      expiryDate,
      credentialId,
      url
    } = body;

    const certification = await prisma.cvCertification.update({
      where: { id: resolvedParams.certificationId },
      data: {
        name,
        issuer,
        issueDate: issueDate ? new Date(issueDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        credentialId,
        url
      }
    });

    return NextResponse.json({ certification });
  } catch (error) {
    console.error("Update certification error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de la certification" },
      { status: 500 }
    );
  }
}

// DELETE - Delete certification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; certificationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "CANDIDAT") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    await prisma.cvCertification.delete({
      where: { id: resolvedParams.certificationId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete certification error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la certification" },
      { status: 500 }
    );
  }
}
