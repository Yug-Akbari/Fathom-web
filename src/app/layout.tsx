import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import ConditionalLayoutWrapper from "@/components/layout/ConditionalLayoutWrapper";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.fathomstore.in"),
  title: {
    default: "FATHOM | Food Dehydrator, Dehydrator & Food Dryer Online India",
    template: "%s | FATHOM",
  },
  description:
    "FATHOM — India's home for premium Food Dehydrators. Shop 5 Tray, 8 Tray 1200W, 12 Tray 1500W & 24 Tray 2000W Professional Food Dehydrators, plus Cold Press Juicers, Smoothie Blenders, Espresso Machines & Coffee Grinders. Free shipping across India.",
  keywords: [
    "fathom", "fathom store", "fathom india",
    "food dehydrator", "food dehydrator india", "dehydrator", "food dryer",
    "best food dehydrator india", "buy food dehydrator online india", "food dehydrator price india",
    "5 tray food dehydrator", "8 tray food dehydrator", "12 tray food dehydrator", "24 tray food dehydrator",
    "professional food dehydrator", "1200w food dehydrator", "1500w food dehydrator", "2000w food dehydrator",
    "fruit dehydrator", "vegetable dehydrator", "commercial food dehydrator india",
    "cold press juicer", "cold press juicer india", "portable smoothie blender", "smoothie blender grinder",
    "3 in 1 espresso machine", "espresso machine india", "electric coffee grinder",
    "premium kitchen appliances india",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "FATHOM",
    title: "FATHOM | Food Dehydrator, Dehydrator & Food Dryer Online India",
    description:
      "Shop premium Food Dehydrators (5, 8, 12 & 24 Tray), Cold Press Juicers, Smoothie Blenders, Espresso Machines & Coffee Grinders. Free shipping across India.",
    url: "https://www.fathomstore.in",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "FATHOM | Food Dehydrator, Dehydrator & Food Dryer Online India",
    description:
      "Shop premium Food Dehydrators, Cold Press Juicers, Smoothie Blenders, Espresso Machines & Coffee Grinders. Free shipping across India.",
  },
  icons: {
    icon: [
      { url: "https://fathomstore.in/favicon.png", sizes: "48x48", type: "image/png" }
    ],
    shortcut: "https://fathomstore.in/favicon.ico",
  },
};

// Site-wide structured data: helps Google, Bing and AI answer engines
// (ChatGPT, Perplexity, Google AI Overviews, Claude) understand who FATHOM is,
// what it sells, and how to contact/find it — key for "AI SEO" / AEO.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.fathomstore.in/#organization",
  name: "FATHOM",
  alternateName: "Fathom Appliances",
  url: "https://www.fathomstore.in",
  logo: "https://www.fathomstore.in/images/fathom-logo-transparent.png",
  description:
    "FATHOM sells premium Food Dehydrators (5, 8, 12 & 24 Tray models), Cold Press Juicers, Portable Smoothie Blenders & Grinders, 3-in-1 Espresso Machines and Electric Coffee Grinders, shipped across India.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "126, Green Plaza Shopping, Mota Varachha",
    addressLocality: "Surat",
    addressRegion: "Gujarat",
    postalCode: "394105",
    addressCountry: "IN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-82385-43000",
    contactType: "customer service",
    email: "fathom.support@gmail.com",
    areaServed: "IN",
    availableLanguage: ["English", "Hindi", "Gujarati"],
  },
  sameAs: ["https://www.instagram.com/fathom.india/"],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://www.fathomstore.in/#website",
  url: "https://www.fathomstore.in",
  name: "FATHOM",
  publisher: { "@id": "https://www.fathomstore.in/#organization" },
  potentialAction: {
    "@type": "SearchAction",
    target: "https://www.fathomstore.in/shop?search={search_term_string}",
    "query-input": "required name=search_term_string",
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
        {/* Structured data for search engines & AI answer engines (AEO) */}
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Script
          id="website-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />

        {/* Google Tag Manager */}
        <Script id="gtm-head" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-TKVDTX7K');
          `}
        </Script>

        {/* Google Analytics via GTM — GA4 still fires through GTM */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TCREYJPKFV"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TCREYJPKFV');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${poppins.variable} antialiased flex flex-col min-h-screen`}>

        {/* Google Tag Manager (noscript fallback) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TKVDTX7K"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <ConditionalLayoutWrapper>
          {children}
        </ConditionalLayoutWrapper>
        <Analytics />
      </body>
    </html>
  );
}
