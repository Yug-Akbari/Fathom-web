"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/lib/CartContext";
import { AuthProvider } from "@/lib/AuthContext";

export default function ConditionalLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <AuthProvider>
      <CartProvider>
        {isAdminRoute ? (
          <main className="flex-grow w-full h-full">{children}</main>
        ) : (
          <>
            <Navbar />
            <main className="flex-grow pt-20 w-full">{children}</main>
            <Footer />
          </>
        )}
      </CartProvider>
    </AuthProvider>
  );
}
