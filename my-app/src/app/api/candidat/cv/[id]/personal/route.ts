import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT - Update personal information
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const resolvedParams = await params;
    if (!session || session.user?.role !== "CANDIDAT") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    // Verify CV belongs to user
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
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      country,
      postalCode,
      dateOfBirth,
      nationality,
      profileImage,
      summary,
      linkedIn,
      website,
      github
    } = body;

    // Upsert personal info
    const personalInfo = await prisma.cvPersonalInfo.upsert({
      where: { cvId: resolvedParams.id },
      update: {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        country,
        postalCode,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        nationality,
        profileImage,
        summary,
        linkedIn,
        website,
        github
      },
      create: {
        cvId: resolvedParams.id,
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        country,
        postalCode,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        nationality,
        profileImage,
        summary,
        linkedIn,
        website,
        github
      }
    });

    return NextResponse.json({ personalInfo });
  } catch (error) {
    console.error("Update personal info error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des informations personnelles" },
      { status: 500 }
    );
  }
}
