import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { notifyNewCandidateSignup } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received signup data:", body); // Debug log
    
    const {
      email,
      password,
      nom,
      prenom,
      cin,
      telephone,
      dateDelivrance,
      lieuDelivrance,
      address,
      nationalite,
      civilite,
      dateNaissance,
      gouvernorat,
      specialite,
    } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 400 }
      );
    }

    // Check if CIN already exists
    if (cin) {
      const existingCIN = await prisma.user.findUnique({
        where: { cin }
      });

      if (existingCIN) {
        return NextResponse.json(
          { error: "Un utilisateur avec ce CIN existe déjà" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with CANDIDAT role by default
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nom,
        prenom,
        cin,
        telephone,
        dateDelivrance: dateDelivrance ? new Date(dateDelivrance) : null,
        lieuDelivrance,
        address,
        nationalite,
        civilite,
        dateNaissance: dateNaissance ? new Date(dateNaissance) : null,
        gouvernorat,
        specialite,
        name: `${prenom} ${nom}`.trim(),
        role: "CANDIDAT", // Default role for signup
      },
    });

    // Notify admins about new candidate signup
    try {
      await notifyNewCandidateSignup({
        id: user.id,
        name: user.name || '',
        email: user.email,
        prenom: user.prenom,
        nom: user.nom,
      });
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
      // Don't fail the signup if notification fails
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        message: "Utilisateur créé avec succès",
        user: userWithoutPassword 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du compte" },
      { status: 500 }
    );
  }
} 