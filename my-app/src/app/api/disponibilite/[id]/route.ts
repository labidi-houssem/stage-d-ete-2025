import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT - Update disponibilite
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const resolvedParams = await params;
    
    if (!session || session.user?.role !== "ENSEIGNANT") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { dateDebut, dateFin } = body;

    // Check if disponibilite exists and belongs to the teacher
    const existingDisponibilite = await prisma.disponibilite.findFirst({
      where: {
        id: resolvedParams.id,
        id_Enseignant: session.user.id
      }
    });

    if (!existingDisponibilite) {
      return NextResponse.json(
        { error: "Disponibilité non trouvée" },
        { status: 404 }
      );
    }

    const disponibilite = await prisma.disponibilite.update({
      where: { id: resolvedParams.id },
      data: {
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin)
      }
    });

    return NextResponse.json(
      { 
        message: "Disponibilité mise à jour avec succès",
        disponibilite 
      }
    );
  } catch (error) {
    console.error("Update disponibilite error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la disponibilité" },
      { status: 500 }
    );
  }
}

// DELETE - Delete disponibilite
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const resolvedParams = await params;
    
    if (!session || session.user?.role !== "ENSEIGNANT") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    // Check if disponibilite exists and belongs to the teacher
    const existingDisponibilite = await prisma.disponibilite.findFirst({
      where: {
        id: resolvedParams.id,
        id_Enseignant: session.user.id
      },
      include: {
        reservations: true
      }
    });

    if (!existingDisponibilite) {
      return NextResponse.json(
        { error: "Disponibilité non trouvée" },
        { status: 404 }
      );
    }

    // Check if there are any reservations
    if (existingDisponibilite.reservations.length > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer une disponibilité avec des réservations" },
        { status: 400 }
      );
    }

    await prisma.disponibilite.delete({
      where: { id: resolvedParams.id }
    });

    return NextResponse.json(
      { message: "Disponibilité supprimée avec succès" }
    );
  } catch (error) {
    console.error("Delete disponibilite error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la disponibilité" },
      { status: 500 }
    );
  }
} 