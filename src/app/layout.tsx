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
        <ConditionalLayoutWrapper>
          {children}
        </ConditionalLayoutWrapper>
        <Analytics />
      </body>
    </html>
  );
}
