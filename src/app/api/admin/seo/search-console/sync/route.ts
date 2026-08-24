import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { google } from 'googleapis';

export async function POST() {
  try {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?>replace(/\\n/g, '\n');

    if (!clientEmail || !privateKey) {
      return NextResponse.json({ success: false, error: 'Google Service Account credentials missing in .env (FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY).' }, { status: 500 });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });

    const webmasters = google.webmasters({ version: 'v3', auth });

    let siteUrl = 'https://nayparfum.ma/';
    
    try {
      await webmasters.sites.get({ siteUrl });
    } catch(err) {
      siteUrl = 'sc-domain:nayparfum.ma';
      await webmasters.sites.get({ siteUrl }).catch(e => {
        throw new Error(`Service account not authorized. Please invite ${clientEmail} to your Google Search Console property (${siteUrl}) with \"Restricted\" or \"Full\" permission.`);
      });
    }

    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - 2);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 28);

    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    const response = await webmasters.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: start,
        endDate: end,
        dimensions: ['date'],
      }
    });

    if (response.data.rows) {
      await prisma.seoSearchConsoleDaily.deleteMany({});
      
      for (const row of response.data.rows) {
        if (row.keys && row.keys.length > 0) {
          const dateStr = row.keys[0];
          const date = new Date(dateStr);
          
          await prisma.seoSearchConsoleDaily.create({
            data: {
              date,
              device: 'ALL',
              country: 'ALL',
              searchType: 'WEB',
              clicks: row.clicks || 0,
              impressions: row.impressions || 0,
              ctr: (row.ctr || 0) * 100,
              position: row.position || 0,
            }
          });
        }
      }
    }

    const kwResponse = await webmasters.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: start,
        endDate: end,
        dimensions: ['query'],
        rowLimit: 100,
      }
    });

    if (kwResponse.data.rows) {
      await prisma.seoKeywordPerformance.deleteMany({});
      
      for (const row of kwResponse.data.rows) {
        if (row.keys && row.keys.length > 0) {
          await prisma.seoKeywordPerformance.create({
            data: {
              query: row.keys[0],
              date: new Date(today),
              country: 'ALL',
              device: 'ALL',
              searchType: 'WEB',
              clicks: row.clicks || 0,
              impressions: row.impressions || 0,
              ctr: (row.ctr || 0) * 100,
              position: row.position || 0,
            }
          });
        }
      }
    }

    const pagesResponse = await webmasters.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: start,
        endDate: end,
        dimensions: ['page'],
        rowLimit: 100,
      }
    });

    if (pagesResponse.data.rows) {
      await prisma.seoPagePerformance.deleteMany({});
      
      for (const row of pagesResponse.data.rows) {
        if (row.keys && row.keys.length > 0) {
          let pageUrl = row.keys[0];
          pageUrl = pageUrl.replace('https://nayparfum.ma', '');
          if (pageUrl === '') pageUrl = '/';

          await prisma.seoPagePerformance.create){
            data: {
              url: pageUrl,
              date: new Date(today),
              country: 'ALL',
              device: 'ALL',
              searchType: 'WEB',
              clicks: row.clicks || 0,
              impressions: row.impressions || 0,
              ctr: (row.ctr || 0) * 100,
              position: row.position || 0
            }
          });
        }
      }
    }

    await prisma.seoSettings.upsert({
      where: { id: 'default' },
      update: { googleSearchConsoleConnected: true },
      create: { id: 'default', googleSearchConsoleConnected: true }
    });

    return NextResponse.json({ success: true, message: 'Sync complete using real Google Search Console data' });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }

}
