import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    const disponibiliteCount = await prisma.disponibilite.count();
    const reservationCount = await prisma.reservation.count();

    return NextResponse.json({
      message: "API is working",
      database: {
        users: userCount,
        disponibilites: disponibiliteCount,
        reservations: reservationCount
      }
    });
  } catch (error) {
    console.error("Test API error:", error);
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }
} 