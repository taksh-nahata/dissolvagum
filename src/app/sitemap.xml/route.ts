import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://dissolvagum.com';
  const staticPages = [
    '',
    '/faq',
    '/legal/terms',
    '/legal/privacy',
    '/legal/accessibility',
    '/get-involved'
  ];

  const urls = staticPages.map(
    (page) => `  <url>\n    <loc>${baseUrl}${page}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
  ).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
