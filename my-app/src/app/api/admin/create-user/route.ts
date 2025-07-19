import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      role,
      nom,
      prenom,
      telephone,
    } = body;

    // Validate role
    if (!['ADMIN', 'ENSEIGNANT', 'CANDIDAT'].includes(role)) {
      return NextResponse.json(
        { error: "Rôle invalide. Doit être ADMIN, ENSEIGNANT ou CANDIDAT" },
        { status: 400 }
      );
    }

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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with specified role
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        nom,
        prenom,
        telephone,
        name: `${prenom} ${nom}`.trim(),
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        message: `Utilisateur ${role} créé avec succès`,
        user: userWithoutPassword 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'utilisateur" },
      { status: 500 }
    );
  }
} 