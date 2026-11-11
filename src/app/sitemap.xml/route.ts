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

  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = staticPages.map(
    (page) => `  <url>\n    <loc>${baseUrl}${page || '/'}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${page ? '0.6' : '1.0'}</priority>\n  </url>`
  ).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
