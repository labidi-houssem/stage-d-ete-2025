import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

// GET - Get specific user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        nom: true,
        prenom: true,
        cin: true,
        telephone: true,
        dateDelivrance: true,
        lieuDelivrance: true,
        address: true,
        nationalite: true,
        civilite: true,
        dateNaissance: true,
        gouvernorat: true,
        specialite: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'utilisateur" },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      email,
      nom,
      prenom,
      role,
      telephone,
      address,
      gouvernorat,
      specialite,
      newPassword,
    } = body;

    // Validate required fields
    if (!email || !nom || !prenom || !role) {
      return NextResponse.json(
        { error: "Email, nom, prénom et rôle sont obligatoires" },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: id }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      email,
      nom,
      prenom,
      role,
      telephone: telephone || null,
      address: address || null,
      gouvernorat: gouvernorat || null,
      specialite: specialite || null,
      name: `${prenom} ${nom}`.trim(),
    };

    // Hash new password if provided
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        nom: true,
        prenom: true,
        cin: true,
        telephone: true,
        dateDelivrance: true,
        lieuDelivrance: true,
        address: true,
        nationalite: true,
        civilite: true,
        dateNaissance: true,
        gouvernorat: true,
        specialite: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      message: "Utilisateur mis à jour avec succès",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'utilisateur" },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Prevent admin from deleting themselves
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas supprimer votre propre compte" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Delete user (this will cascade to related records)
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({
      message: "Utilisateur supprimé avec succès"
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'utilisateur" },
      { status: 500 }
    );
  }
}