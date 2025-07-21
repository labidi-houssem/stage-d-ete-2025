import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

// GET - Get CANDIDAT profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "CANDIDAT") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
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
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du profil" },
      { status: 500 }
    );
  }
}

// PUT - Update CANDIDAT profile
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
    const {
      nom,
      prenom,
      telephone,
      address,
      gouvernorat,
      specialite,
      currentPassword,
      newPassword,
    } = body;
    if (!nom || !prenom) {
      return NextResponse.json(
        { error: "Nom et prénom sont obligatoires" },
        { status: 400 }
      );
    }
    // If password change is requested, validate current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Mot de passe actuel requis pour changer le mot de passe" },
          { status: 400 }
        );
      }
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true },
      });
      if (!currentUser || !currentUser.password) {
        return NextResponse.json(
          { error: "Utilisateur non trouvé ou mot de passe manquant" },
          { status: 404 }
        );
      }
      const passwordMatch = await bcrypt.compare(currentPassword, currentUser.password);
      if (!passwordMatch) {
        return NextResponse.json(
          { error: "Mot de passe actuel incorrect" },
          { status: 400 }
        );
      }
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          password: await bcrypt.hash(newPassword, 10),
        },
      });
    }
    // Update profile fields
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        nom,
        prenom,
        telephone,
        address,
        gouvernorat,
        specialite,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    );
  }
} 