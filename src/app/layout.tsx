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
  title: {
    default: "FATHOM | Food Dehydrator",
    template: "%s | FATHOM",
  },
  description:
    "FATHOM — Shop premium Food Dehydrator, Food Dryer, Dehydrator, Coffee Machine & Coffee Grinder online. Free shipping across India.",
  keywords: [
    "fathom",
    "fathom store",
    "food dehydrator",
    "dehydrator",
    "food dryer",
    "food dehydrator India",
    "buy dehydrator online India",
    "best food dehydrator India",
    "food dryer India",
    "coffee machine",
    "coffee grinder",
    "premium home appliances India",
  ],
  icons: {
    icon: [
      { url: "https://fathomstore.in/favicon.png", sizes: "48x48", type: "image/png" }
    ],
    shortcut: "https://fathomstore.in/favicon.ico",
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
