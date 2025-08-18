import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  // Find all users with role 'CANDIDAT' who do not have any interview requests
  // (meaning they haven't been assigned to any enseignant yet)
  const candidates = await prisma.user.findMany({
    where: {
      role: "CANDIDAT",
      interviewRequestsAsCandidate: { none: {} },
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ candidates });
} 