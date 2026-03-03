import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import Script from "next/script";
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
  title: "FATHOM Elite",
  description: "Ultra-Premium Kitchen Appliances.",
  icons: {
    icon: "/images/favicon.svg",
    shortcut: "/images/favicon.svg",
    apple: "/images/favicon.svg",
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
      </body>
    </html>
  );
}
