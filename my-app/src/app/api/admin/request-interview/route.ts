import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notifyInterviewRequest } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    console.log("=== Interview Request API Called ===");
    
    const session = await getServerSession(authOptions);
    console.log("Session:", session);
    console.log("Session user:", session?.user);
    console.log("Session user role:", (session?.user as any)?.role);
    console.log("Session user id:", (session?.user as any)?.id);
    
    if (!session) {
      console.log("No session found");
      return NextResponse.json({ error: "Session non trouvée" }, { status: 401 });
    }
    
    if ((session.user as any)?.role !== "ADMIN") {
      console.log("User is not admin, role:", (session.user as any)?.role);
      return NextResponse.json({ error: "Non autorisé - Admin requis" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
      console.log("Request body:", body);
    } catch (parseError) {
      console.log("Error parsing request body:", parseError);
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }
    
    const { candidateId, enseignantId } = body;
    console.log("Extracted IDs:", { candidateId, enseignantId });
    
    if (!candidateId || !enseignantId) {
      console.log("Missing required fields:", { candidateId, enseignantId });
      return NextResponse.json({ 
        error: "Missing candidateId or enseignantId",
        received: { candidateId, enseignantId }
      }, { status: 400 });
    }

    const adminId = (session.user as any).id;
    console.log("Admin ID:", adminId);

    // Verify candidate exists
    console.log("Checking candidate:", candidateId);
    const candidate = await prisma.user.findUnique({
      where: { id: candidateId, role: "CANDIDAT" }
    });
    console.log("Candidate found:", candidate);
    
    if (!candidate) {
      console.log("Candidate not found with ID:", candidateId);
      return NextResponse.json({ 
        error: "Candidat non trouvé",
        candidateId: candidateId
      }, { status: 404 });
    }

    // Verify enseignant exists
    console.log("Checking enseignant:", enseignantId);
    const enseignant = await prisma.user.findUnique({
      where: { id: enseignantId, role: "ENSEIGNANT" }
    });
    console.log("Enseignant found:", enseignant);
    
    if (!enseignant) {
      console.log("Enseignant not found with ID:", enseignantId);
      return NextResponse.json({ 
        error: "Enseignant non trouvé",
        enseignantId: enseignantId
      }, { status: 404 });
    }

    // Create interview request
    console.log("Creating interview request...");
    const interviewRequest = await prisma.interviewRequest.create({
      data: {
        adminId,
        enseignantId,
        candidateId,
        status: "PENDING"
      },
      include: {
        candidate: true,
        enseignant: true,
        admin: true
      }
    });

    console.log("Created interview request:", interviewRequest);

    // Create notification for enseignant
    console.log("Creating enseignant notification...");
    await prisma.notification.create({
      data: {
        userId: enseignantId,
        type: "interview_request",
        message: `Un candidat (${candidate.name || candidate.email}) demande un entretien. Veuillez choisir une date/heure et confirmer.`,
        link: "/enseignant/interview-requests",
      }
    });

    // Create notification for candidate
    console.log("Creating candidate notification...");
    await prisma.notification.create({
      data: {
        userId: candidateId,
        type: "interview_requested",
        message: `Votre demande d'entretien a été envoyée à ${enseignant.name || enseignant.email}. En attente de confirmation.`,
        link: "/etudiant/dashboard",
      }
    });

    // Notify admins about interview request (excluding the admin who created it)
    try {
      await notifyInterviewRequest({
        id: interviewRequest.id,
        candidatId: candidateId,
        enseignantId: enseignantId,
        candidatName: candidate.prenom && candidate.nom 
          ? `${candidate.prenom} ${candidate.nom}` 
          : candidate.name || 'Candidat',
        enseignantName: enseignant.prenom && enseignant.nom 
          ? `${enseignant.prenom} ${enseignant.nom}` 
          : enseignant.name || 'Enseignant',
        dateDebut: new Date(), // Will be updated when teacher sets availability
        dateFin: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      });
    } catch (notificationError) {
      console.error('Failed to send interview request notification:', notificationError);
      // Don't fail the request if notification fails
    }

    console.log("Interview request completed successfully");
    return NextResponse.json({ 
      message: "Demande d'entretien envoyée avec succès",
      interviewRequest: {
        id: interviewRequest.id,
        candidate: { id: candidate.id, name: candidate.name, email: candidate.email },
        enseignant: { id: enseignant.id, name: enseignant.name, email: enseignant.email },
        status: interviewRequest.status
      }
    });

  } catch (error) {
    console.error("=== Error in request-interview API ===");
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