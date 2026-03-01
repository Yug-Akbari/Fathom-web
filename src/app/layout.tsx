import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
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
      <body className={`${inter.variable} ${poppins.variable} antialiased flex flex-col min-h-screen`}>
        <ConditionalLayoutWrapper>
          {children}
        </ConditionalLayoutWrapper>
      </body>
    </html>
  );
}
