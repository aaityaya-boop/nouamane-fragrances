import { google } from 'googleapis';
import prisma from './prisma';

// Helper to encrypt/decrypt tokens in database (Basic placeholder)
const encrypt = (text: string) => Buffer.from(text).toString('base64');
const decrypt = (hash: string) => Buffer.from(hash, 'base64').toString('utf-8');

export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/admin/seo/search-console/callback';

  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are not set in environment variables');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export async function getGscClient() {
  const connection = await prisma.googleSearchConsoleConnection.findFirst({
    orderBy: { createdAt: 'desc' }
  });

  if (!connection) {
    throw new Error('No Google Search Console connection found');
  }

  const oauth2Client = getOAuth2Client();
  
  oauth2Client.setCredentials({
    access_token: decrypt(connection.accessTokenEncrypted),
    refresh_token: decrypt(connection.refreshTokenEncrypted),
    expiry_date: connection.tokenExpiresAt.getTime()
  });

  // Automatically handle token refresh and save back to DB
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token) {
      await prisma.googleSearchConsoleConnection.update({
        where: { id: connection.id },
        data: {
          accessTokenEncrypted: encrypt(tokens.access_token!),
          refreshTokenEncrypted: encrypt(tokens.refresh_token),
          tokenExpiresAt: new Date(tokens.expiry_date!),
        }
      });
    } else if (tokens.access_token) {
      await prisma.googleSearchConsoleConnection.update({
        where: { id: connection.id },
        data: {
          accessTokenEncrypted: encrypt(tokens.access_token),
          tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : connection.tokenExpiresAt,
        }
      });
    }
  });

  return google.webmasters({
    version: 'v3',
    auth: oauth2Client
  });
}

