import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    console.log("=== Assigned Candidates API Called ===");
    
    const session = await getServerSession(authOptions);
    console.log("Session:", session);
    console.log("Session user:", session?.user);
    console.log("Session user role:", (session?.user as any)?.role);
    
    if (!session) {
      console.log("No session found");
      return NextResponse.json({ error: "Session non trouvée" }, { status: 401 });
    }
    
    if ((session.user as any)?.role !== "ADMIN") {
      console.log("User is not admin, role:", (session.user as any)?.role);
      return NextResponse.json({ error: "Non autorisé - Admin requis" }, { status: 401 });
    }

    console.log("Fetching interview requests...");
    
    // Get all interview requests (assigned candidates) with detailed information
    const interviewRequests = await prisma.interviewRequest.findMany({
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            specialite: true
          }
        },
        enseignant: {
          select: {
            id: true,
            name: true,
            email: true,
            specialite: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    console.log("Found interview requests:", interviewRequests.length);

    // Transform the data to match the frontend expectations
    const candidates = interviewRequests.map(req => ({
      id: req.candidate.id,
      name: req.candidate.name,
      email: req.candidate.email,
      createdAt: req.createdAt,
      specialite: req.candidate.specialite,
      enseignant: {
        id: req.enseignant.id,
        name: req.enseignant.name,
        email: req.enseignant.email,
        specialite: req.enseignant.specialite
      },
      status: req.status,
      dateEntretien: req.dateEntretien,
      meetLink: req.meetLink,
      requestCreatedAt: req.createdAt
    }));

    console.log("Transformed candidates:", candidates.length);
    console.log("Assigned candidates API completed successfully");

    return NextResponse.json({ candidates });

  } catch (error) {
    console.error("=== Error in assigned-candidates API ===");
    console.error("Error details:", error);
    console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    // Return more specific error information
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: "Erreur interne du serveur",
        details: error.message,
        type: error.constructor.name
      }, { status: 500 });
    } else {
      return NextResponse.json({ 
        error: "Erreur interne du serveur",
        details: "Unknown error type"
      }, { status: 500 });
    }
  }
} 