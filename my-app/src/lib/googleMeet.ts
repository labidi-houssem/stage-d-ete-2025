import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const auth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: SCOPES,
});

const calendar = google.calendar({ version: 'v3', auth });

export async function createMeetEvent({ summary, description, start, end, attendees }) {
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