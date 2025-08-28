import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Get all candidates with CVs (for teachers and admins)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ENSEIGNANT", "ADMIN"].includes(session.user?.role)) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    // Get all candidates who have created CVs
    const candidatesWithCVs = await prisma.user.findMany({
      where: {
        role: "CANDIDAT",
        cv: {
          isNot: null
        }
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        specialite: true,
        telephone: true,
        createdAt: true,
        cv: {
          select: {
            id: true,
            title: true,
            updatedAt: true,
            personalInfo: {
              select: {
                firstName: true,
                lastName: true,
                summary: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate completion percentage for each CV
    const candidatesWithCompletion = await Promise.all(
      candidatesWithCVs.map(async (candidate) => {
        if (!candidate.cv) return candidate;

        const cvDetails = await prisma.cv.findUnique({
          where: { id: candidate.cv.id },
          include: {
            personalInfo: true,
            education: true,
            experience: true,
            skills: true,
            languages: true,
            projects: true,
            certifications: true
          }
        });

        let completionScore = 0;
        const maxScore = 100;

        if (cvDetails) {
          // Personal info (30 points)
          if (cvDetails.personalInfo) {
            if (cvDetails.personalInfo.firstName) completionScore += 5;
            if (cvDetails.personalInfo.lastName) completionScore += 5;
            if (cvDetails.personalInfo.email) completionScore += 5;
            if (cvDetails.personalInfo.phone) completionScore += 5;
            if (cvDetails.personalInfo.summary) completionScore += 10;
          }

          // Education (20 points)
          if (cvDetails.education.length > 0) {
            completionScore += Math.min(cvDetails.education.length * 10, 20);
          }

          // Experience (20 points)
          if (cvDetails.experience.length > 0) {
            completionScore += Math.min(cvDetails.experience.length * 10, 20);
          }

          // Skills (15 points)
          if (cvDetails.skills.length > 0) {
            completionScore += Math.min(cvDetails.skills.length * 3, 15);
          }

          // Languages (10 points)
          if (cvDetails.languages.length > 0) {
            completionScore += Math.min(cvDetails.languages.length * 5, 10);
          }

          // Projects (5 points)
          if (cvDetails.projects.length > 0) {
            completionScore += Math.min(cvDetails.projects.length * 5, 5);
          }
        }

        const completionPercentage = Math.min(completionScore, maxScore);

        return {
          ...candidate,
          cv: {
            ...candidate.cv,
            completionPercentage
          }
        };
      })
    );

    return NextResponse.json({ candidates: candidatesWithCompletion });
  } catch (error) {
    console.error("Get candidates with CV error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des candidats" },
      { status: 500 }
    );
  }
}
