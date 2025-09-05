import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const auth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: SCOPES,
});

const calendar = google.calendar({ version: 'v3', auth });

async function createMeetEvent({ summary, description, start, end, attendees }) {
  const event = {
    summary,
    description,
    start: { dateTime: start, timeZone: 'Europe/Paris' },
    end: { dateTime: end, timeZone: 'Europe/Paris' },
    attendees,
    conferenceData: {
      createRequest: { requestId: Math.random().toString(36).substring(2) }
    }
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
    conferenceDataVersion: 1,
  });

  return response.data.hangoutLink; // This is the Google Meet link
}

// GET - Get notifications for the current user
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: [
      { read: "asc" }, // Unread first
      { createdAt: "desc" },
    ],
    take: 20,
  });
  return NextResponse.json({ notifications });
} 