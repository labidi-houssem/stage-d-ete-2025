import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    // Get user statistics
    const [
      totalUsers,
      admins,
      enseignants,
      candidats,
      etudiants,
      totalReservations,
      pendingReservations,
      confirmedReservations,
      cancelledReservations,
      completedReservations,
      acceptedReservations,
      refusedReservations
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "ENSEIGNANT" } }),
      prisma.user.count({ where: { role: "CANDIDAT" } }),
      prisma.user.count({ where: { role: "ETUDIANT" } }),
      prisma.reservation.count(),
      prisma.reservation.count({ where: { status: "EN_ATTENTE" } }),
      prisma.reservation.count({ where: { status: "CONFIRMEE" } }),
      prisma.reservation.count({ where: { status: "ANNULEE" } }),
      prisma.reservation.count({ where: { status: "TERMINEE" } }),
      prisma.reservation.count({ where: { result: "ACCEPTER" } }),
      prisma.reservation.count({ where: { result: "REFUSER" } })
    ]);

    // Get recent activities (last 10 reservations)
    const recentReservations = await prisma.reservation.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        candidat: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
          }
        },
        disponibilite: {
          include: {
            enseignant: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Get monthly statistics for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await prisma.reservation.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      _count: {
        status: true
      }
    });

    // Get speciality distribution
    const specialityStats = await prisma.user.groupBy({
      by: ['specialite'],
      where: {
        specialite: {
          not: null
        }
      },
      _count: {
        specialite: true
      }
    });

    // Get gouvernorat distribution
    const gouvernoratStats = await prisma.user.groupBy({
      by: ['gouvernorat'],
      where: {
        gouvernorat: {
          not: null
        }
      },
      _count: {
        gouvernorat: true
      }
    });

    return NextResponse.json({
      users: {
        total: totalUsers,
        admins,
        enseignants,
        candidats,
        etudiants
      },
      reservations: {
        total: totalReservations,
        pending: pendingReservations,
        confirmed: confirmedReservations,
        cancelled: cancelledReservations,
        completed: completedReservations,
        accepted: acceptedReservations,
        refused: refusedReservations
      },
      recentActivities: recentReservations.map(reservation => ({
        id: reservation.id,
        status: reservation.status,
        result: reservation.result,
        candidat: reservation.candidat ? {
          name: `${reservation.candidat.prenom} ${reservation.candidat.nom}`,
          email: reservation.candidat.email
        } : null,
        enseignant: reservation.disponibilite?.enseignant ? {
          name: `${reservation.disponibilite.enseignant.prenom} ${reservation.disponibilite.enseignant.nom}`,
          email: reservation.disponibilite.enseignant.email
        } : null,
        createdAt: reservation.createdAt
      })),
      monthlyStats,
      specialityStats,
      gouvernoratStats
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}