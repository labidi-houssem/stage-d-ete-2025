import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Get candidate's CV
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "CANDIDAT") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const cv = await prisma.cv.findUnique({
      where: { candidatId: session.user.id },
      include: {
        personalInfo: true,
        education: { orderBy: { order: 'asc' } },
        experience: { orderBy: { order: 'asc' } },
        skills: { orderBy: { order: 'asc' } },
        languages: { orderBy: { order: 'asc' } },
        projects: { orderBy: { order: 'asc' } },
        certifications: { orderBy: { order: 'asc' } }
      }
    });

    if (!cv) {
      return NextResponse.json({ cv: null });
    }

    // Calculate completion percentage
    let completionScore = 0;
    const maxScore = 100;

    // Personal info (30 points)
    if (cv.personalInfo) {
      if (cv.personalInfo.firstName) completionScore += 5;
      if (cv.personalInfo.lastName) completionScore += 5;
      if (cv.personalInfo.email) completionScore += 5;
      if (cv.personalInfo.phone) completionScore += 5;
      if (cv.personalInfo.summary) completionScore += 10;
    }

    // Education (20 points)
    if (cv.education.length > 0) {
      completionScore += Math.min(cv.education.length * 10, 20);
    }

    // Experience (20 points)
    if (cv.experience.length > 0) {
      completionScore += Math.min(cv.experience.length * 10, 20);
    }

    // Skills (15 points)
    if (cv.skills.length > 0) {
      completionScore += Math.min(cv.skills.length * 3, 15);
    }

    // Languages (10 points)
    if (cv.languages.length > 0) {
      completionScore += Math.min(cv.languages.length * 5, 10);
    }

    // Projects (5 points)
    if (cv.projects.length > 0) {
      completionScore += Math.min(cv.projects.length * 5, 5);
    }

    const completionPercentage = Math.min(completionScore, maxScore);

    return NextResponse.json({
      cv: {
        ...cv,
        completionPercentage
      }
    });
  } catch (error) {
    console.error("Get CV error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du CV" },
      { status: 500 }
    );
  }
}

// POST - Create new CV
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "CANDIDAT") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, template } = body;

    // Check if user already has a CV
    const existingCV = await prisma.cv.findUnique({
      where: { candidatId: session.user.id }
    });

    if (existingCV) {
      return NextResponse.json(
        { error: "Vous avez déjà un CV. Vous pouvez le modifier." },
        { status: 400 }
      );
    }

    // Create new CV with basic personal info from user profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    const cv = await prisma.cv.create({
      data: {
        candidatId: session.user.id,
        title: title || "Mon CV",
        template: template || "modern",
        personalInfo: {
          create: {
            firstName: user?.prenom || "",
            lastName: user?.nom || "",
            email: user?.email || "",
            phone: user?.telephone || "",
          }
        }
      },
      include: {
        personalInfo: true
      }
    });

    return NextResponse.json({ cv });
  } catch (error) {
    console.error("Create CV error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du CV" },
      { status: 500 }
    );
  }
}

// PUT - Update CV basic info
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "CANDIDAT") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, template, isPublic } = body;

    const cv = await prisma.cv.update({
      where: { candidatId: session.user.id },
      data: {
        title,
        template,
        isPublic
      }
    });

    return NextResponse.json({ cv });
  } catch (error) {
    console.error("Update CV error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du CV" },
      { status: 500 }
    );
  }
}
