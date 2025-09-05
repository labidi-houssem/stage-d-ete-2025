import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST - Add certification
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
      name,
      issuer,
      issueDate,
      expiryDate,
      credentialId,
      url
    } = body;

    const certification = await prisma.cvCertification.create({
      data: {
        cvId: resolvedParams.id,
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
    console.error("Create certification error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout de la certification" },
      { status: 500 }
    );
  }
}
