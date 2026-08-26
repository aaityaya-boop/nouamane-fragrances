import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nayparfum.ma";
    const sitemapUrl = `${baseUrl}/sitemap.xml`;

    let httpStatus = 0;
    let isValid = false;
    let urlCount = 0;
    let errorMessage = null;
    let urls: string[] = [];

    try {
      const response = await fetch(sitemapUrl, { headers: { "User-Agent": "NAY-SEO-Bot/1.0" } });
      httpStatus = response.status;
      
      if (response.ok) {
        const xml = await response.text();
        if (xml.includes("<?xml") && xml.includes("<urlset")) {
          isValid = true;
          // Extract URLs using regex
          const locMatches = xml.match(/<loc>([^<]+)<\/loc>/g);
          if (locMatches) {
            urls = locMatches.map(m => m.replace(/<\/?loc>/g, "").trim());
            urlCount = urls.length;
          }
        } else {
          errorMessage = "Invalid XML format";
        }
      } else {
        errorMessage = `HTTP Status ${httpStatus}`;
      }
    } catch (e: any) {
      errorMessage = e.message;
    }

    // Upsert status
    await prisma.seoSitemapStatus.upsert({
      where: { sitemapUrl },
      create: {
        sitemapUrl,
        httpStatus,
        isValid,
        urlCount,
        errorMessage,
        lastCheckedAt: new Date()
      },
      update: {
        httpStatus,
        isValid,
        urlCount,
        errorMessage,
        lastCheckedAt: new Date()
      }
    });

    // Clear old sitemap issues
    await prisma.seoIssue.deleteMany({
      where: { type: { in: ['SITEMAP_MISSING', 'SITEMAP_ERROR', 'SITEMAP_URL_404', 'SITEMAP_URL_NOINDEX'] } }
    });

    if (!isValid) {
      await prisma.seoIssue.create({
        data: {
          url: sitemapUrl,
          type: "SITEMAP_ERROR",
          severity: "CRITICAL",
          title: "Sitemap is invalid or missing",
          recommendation: "Ensure /sitemap.xml is correctly generated and accessible.",
          status: "OPEN"
        }
      });
      
      // Redirect back
      return NextResponse.redirect(new URL('/admin/seo/sitemap', request.url));
    }

    // We could do a deeper check (fetch first 10 urls to see if they 404)
    // To respect timeouts, we'll just check a few randomly or sequentially.
    const maxChecks = Math.min(urls.length, 5); // Limit for the API response time
    for (let i = 0; i < maxChecks; i++) {
      const u = urls[i];
      try {
        const res = await fetch(u, { method: 'HEAD', headers: { "User-Agent": "NAY-SEO-Bot/1.0" }, redirect: "manual" });
        if (res.status >= 400) {
          await prisma.seoIssue.create({
            data: {
              url: u,
              type: "SITEMAP_URL_404",
              severity: "HIGH",
              title: `Sitemap URL returns ${res.status}`,
              recommendation: "Remove broken URLs from sitemap or set up a 301 redirect.",
              status: "OPEN"
            }
          });
        } else if (res.status >= 300 && res.status < 400) {
          await prisma.seoIssue.create({
            data: {
              url: u,
              type: "SITEMAP_URL_REDIRECT",
              severity: "MEDIUM",
              title: "Sitemap URL redirects",
              recommendation: "Sitemaps should only contain final canonical URLs returning 200 OK.",
              status: "OPEN"
            }
          });
        }
      } catch (e) {
        // network error
      }
    }

    return NextResponse.redirect(new URL('/admin/seo/sitemap', request.url));

  } catch (error: any) {
    console.error("Sitemap Check Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
