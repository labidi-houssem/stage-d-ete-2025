import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const notif = await prisma.notification.findUnique({ where: { id: params.id } });
  if (!notif || notif.userId !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }
  const updated = await prisma.notification.update({
    where: { id: params.id },
    data: { read: true },
  });
  return NextResponse.json({ notification: updated });
} 