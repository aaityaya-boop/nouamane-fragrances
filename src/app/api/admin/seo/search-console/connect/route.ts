import { NextResponse } from 'next/server';
import { getOAuth2Client } from '@/lib/gsc';

export async function GET() {
  try {
    const oauth2Client = getOAuth2Client();
    
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/webmasters.readonly'],
      prompt: 'consent'
    });

    return NextResponse.redirect(url);
  } catch (error) {
    console.error('Error generating GSC auth URL:', error);
    return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 });
  }
}

