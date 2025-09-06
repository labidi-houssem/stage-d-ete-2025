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

    // Get interview requests for this enseignant (both pending and accepted)
    const requests = await prisma.interviewRequest.findMany({
      where: {
        enseignantId,
        status: { in: ["PENDING", "ACCEPTED"] }
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

    // For each request, check if there's an evaluation
    const requestsWithEvaluations = await Promise.all(
      requests.map(async (request) => {
        // Find the reservation for this interview request
        const reservation = await prisma.reservation.findFirst({
          where: {
            id_Candidat: request.candidateId,
            disponibilite: {
              id_Enseignant: enseignantId
            }
          },
          include: {
            evaluation: true,
            disponibilite: true
          }
        });

        return {
          ...request,
          dateEntretien: reservation?.disponibilite?.dateDebut || null,
          meetLink: reservation?.meetLink || null,
          evaluation: reservation?.evaluation || null
        };
      })
    );

    console.log("Requests with evaluations:", requestsWithEvaluations);

    return NextResponse.json({ requests: requestsWithEvaluations });

  } catch (error) {
    console.error("Error fetching interview requests:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
} 