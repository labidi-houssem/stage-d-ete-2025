import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ENSEIGNANT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const enseignantId = (session.user as any).id;
    console.log("Fetching interview requests for enseignant:", enseignantId);

    // Get interview requests for this enseignant
    const requests = await prisma.interviewRequest.findMany({
      where: {
        enseignantId,
        status: "PENDING"
      },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        enseignant: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    console.log("Found interview requests:", requests);

    return NextResponse.json({ requests });

  } catch (error) {
    console.error("Error fetching interview requests:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
} 