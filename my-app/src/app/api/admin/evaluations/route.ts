import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all evaluations with candidate and teacher information
    const evaluations = await prisma.interviewEvaluation.findMany({
      include: {
        candidat: {
          select: {
            id: true,
            name: true,
            email: true,
            prenom: true,
            nom: true,
          }
        },
        enseignant: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Add status field (we'll need to add this to the database schema)
    const evaluationsWithStatus = evaluations.map(evaluation => ({
      ...evaluation,
      status: evaluation.status || 'PENDING' // Default to PENDING if not set
    }));

    return NextResponse.json({ 
      evaluations: evaluationsWithStatus 
    });

  } catch (error) {
    console.error("Error fetching evaluations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
