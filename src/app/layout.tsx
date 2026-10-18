import type { Metadata } from "next";
import "lenis/dist/lenis.css";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "DissolvaGum | Chew some gum. Skip the mess.",
  description: "DissolvaGum is a startup founded by four high school students in Folsom, California, designing a chewing gum that is safe to swallow. In development.",
  keywords: ["dissolvagum", "dissolva gum", "swallowable gum", "gum alternative", "litter-free gum", "student startup", "Folsom California"],
  openGraph: {
    title: "DissolvaGum | Chew some gum. Skip the mess.",
    description: "Four high school students in Folsom, California are designing a gum that is safe to swallow. In development.",
    type: "website",
    url: "https://dissolvagum.com",
    images: [
      {
        url: "https://dissolvagum.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "DissolvaGum",
      },
    ],
    siteName: "DissolvaGum"
  },
  twitter: undefined,
  alternates: {
    canonical: "https://dissolvagum.com",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/image-removebg-preview%20(12).png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/image-removebg-preview%20(12).ico" type="image/x-icon" sizes="32x32" />
        <link rel="shortcut icon" href="/image-removebg-preview%20(12).png" type="image/png" />
        <link rel="apple-touch-icon" href="/image-removebg-preview%20(12).png" />
        
        {/* The page font, fetched early so the intro never waits on it */}
        <link rel="preload" href="/fonts/GlacialIndifference-Regular.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/GlacialIndifference-Bold.otf" as="font" type="font/otf" crossOrigin="anonymous" />

        {/* Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="author" content="DissolvaGum" />
        <meta name="theme-color" content="#1f5133" />
        <meta name="copyright" content="DissolvaGum" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="DissolvaGum" />
        <meta property="og:url" content="https://dissolvagum.com" />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:image:alt" content="DissolvaGum Logo" />
        <meta name="subject" content="A gum designed to be safe to swallow, in development" />
        <meta name="language" content="English" />
        <meta name="coverage" content="Worldwide" />
        <meta name="google-site-verification" content="U2zmStviN-onNwcuImdTdo-Lt1iflXPkxbUOwHAt0NU" />

        {/* Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "DissolvaGum",
            "url": "https://dissolvagum.com",
            "logo": "https://dissolvagum.com/og-image.png",
            "description": "A startup founded by four high school students in Folsom, California, designing a chewing gum that is safe to swallow.",
            "sameAs": [
              "https://instagram.com/DissolvaGum"
            ],
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Folsom",
              "addressRegion": "CA",
              "addressCountry": "US"
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is DissolvaGum?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "DissolvaGum is a student startup in Folsom, California, designing a chewing gum that is safe to swallow once you finish chewing, so it never becomes litter."
                }
              },
              {
                "@type": "Question",
                "name": "Can I buy DissolvaGum yet?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Not yet. DissolvaGum is in early research and development, and its design goals have not been met yet."
                }
              },
              {
                "@type": "Question",
                "name": "What does designed to be safe to swallow mean?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The spent gum is meant to be digestible and biodegradable, so it never ends up on the ground. These are design goals we are working toward, not proven results."
                }
              }
            ]
          }
        ])}} />

        {/* Microsoft Clarity tracking code */}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "rziz413g4c");
            `
          }}
        />
      </head>
      <body className="bg-background text-foreground">
        <div id="site-banner" className="bg-secondary px-4 py-2 text-center text-xs font-bold text-foreground sm:text-sm">
          A concept in development. Nothing is for sale.
        </div>
        <SmoothScroll />
        {children}
        {/* fine film grain over everything; purely visual */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[60] opacity-[0.07] mix-blend-overlay"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
