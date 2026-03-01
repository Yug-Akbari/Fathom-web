"use client";

import Link from "next/link";
import { Search, ShoppingBag, User, X, LogOut, Shield } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import Image from "next/image";

const navLinks = [
  { text: "Home", href: "/" },
  { text: "Shop", href: "/shop" },
  { text: "About", href: "/about" },
  { text: "Contact", href: "/contact" },
];

const WHATSAPP_NUMBER = "919173546159";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { items, removeItem, clearCart, isCartOpen, setIsCartOpen } = useCart();
  const { user, isAdmin, loginWithGoogle, logout } = useAuth();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sendWhatsAppInquiry = () => {
    const productList = items.map((item, i) => `${i+1}. ${item.name} - ₹${item.price.toLocaleString('en-IN')}`).join('\n');
    const message = `Hello FATHOM,\n\nI'm interested in the following products:\n\n${productList}\n\nPlease share more details.`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    clearCart();
    setIsCartOpen(false);
  };

  return (
    <>
      <motion.nav 
        initial={{ backgroundColor: "rgba(249, 248, 246, 0)", backdropFilter: "blur(0px)", borderBottomColor: "rgba(229, 231, 235, 0)" }}
        animate={{ 
          backgroundColor: scrolled ? "rgba(249, 248, 246, 0.8)" : "rgba(249, 248, 246, 0)",
          backdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
          borderBottomColor: scrolled ? "rgba(229, 231, 235, 1)" : "rgba(229, 231, 235, 0)"
        }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 w-full z-50 border-b-[1px]`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-5 h-5 bg-accent rounded-sm transform rotate-45"></div>
            <span className="font-poppins font-bold text-xl tracking-widest text-primary uppercase">
              Fathom
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className="relative group text-sm font-semibold text-primary/80 hover:text-primary transition-colors tracking-[0.2em] uppercase">
                  {link.text}
                  <span className={`absolute -bottom-1 left-0 h-[2px] bg-accent transition-all duration-300 ease-out origin-left ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                </Link>
              );
            })}
            {/* Admin link - only for admin users */}
            {isAdmin && (
              <Link href="/admin" className="relative group text-sm font-semibold text-accent hover:text-primary transition-colors tracking-[0.2em] uppercase flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                Admin
                <span className={`absolute -bottom-1 left-0 h-[2px] bg-accent transition-all duration-300 ease-out origin-left ${pathname?.startsWith('/admin') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
            )}
          </div>

          {/* Icons Area */}
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center relative mr-2">
              <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch} className="w-48 bg-transparent text-sm border-b border-gray-300 focus:border-primary outline-none py-1 placeholder-gray-400 transition-colors" />
              <Search className="w-4 h-4 text-gray-500 absolute right-0 cursor-pointer" onClick={() => { if (searchQuery.trim()) { router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`); setSearchQuery(""); }}} />
            </div>
            
            {/* Auth Button */}
            {user ? (
              <button onClick={logout} className="text-primary hover:text-accent transition-colors magnet-button" title="Sign Out">
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <Link href="/login" className="text-primary hover:text-accent transition-colors magnet-button" title="Sign In">
                <User className="w-5 h-5" />
              </Link>
            )}

            {/* Cart Button */}
            <Link href="/cart" className="relative text-primary hover:text-accent transition-colors magnet-button mr-4">
              <ShoppingBag className="w-5 h-5" />
              {items.length > 0 && (
                <span className="absolute -top-[6px] -right-[8px] w-4 h-4 bg-accent rounded-full text-[9px] text-white flex items-center justify-center font-bold">{items.length}</span>
              )}
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[60]" 
              onClick={() => setIsCartOpen(false)}
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[61] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-poppins font-bold text-primary">Inquiry Cart</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-black">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <ShoppingBag className="w-16 h-16 mb-4 opacity-30" />
                    <p className="font-bold text-sm uppercase tracking-widest">Cart is empty</p>
                    <p className="text-xs mt-2">Add products to send a WhatsApp inquiry</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-16 h-16 bg-white rounded-lg overflow-hidden relative shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-poppins font-bold text-sm text-primary truncate">{item.name}</h4>
                          <p className="text-accent font-medium text-sm">₹{item.price.toLocaleString('en-IN')}</p>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="p-6 border-t border-gray-100 flex flex-col gap-3">
                  <p className="text-xs text-gray-400 text-center uppercase tracking-widest">{items.length} product{items.length > 1 ? 's' : ''} selected</p>
                  <button 
                    onClick={sendWhatsAppInquiry}
                    className="w-full bg-[#1FAF38] hover:bg-[#1A9C31] text-white font-bold tracking-[0.1em] text-sm py-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-[0_4px_14px_rgba(31,175,56,0.25)]"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Send WhatsApp Inquiry
                  </button>
                  <button 
                    onClick={() => { clearCart(); setIsCartOpen(false); }}
                    className="w-full border border-gray-200 text-primary font-bold text-xs uppercase tracking-widest py-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
