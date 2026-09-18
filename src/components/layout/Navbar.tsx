"use client";

import Link from "next/link";
import { Search, ShoppingBag, User, X, LogOut, Shield, Menu, ChevronRight, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

const navLinks = [
  { text: "Home", href: "/" },
  { text: "Shop", href: "/shop" },
  { text: "About", href: "/about" },
  { text: "Contact", href: "/contact" },
];

const WHATSAPP_NUMBER = "918238543000";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { items, removeItem, clearCart, isCartOpen, setIsCartOpen } = useCart();
  const { user, isAdmin, loginWithGoogle, logout } = useAuth();

  // Shop dropdown state
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isMobileShopExpanded, setIsMobileShopExpanded] = useState(false);
  const shopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch categories for the dropdown
  useEffect(() => {
    const q = query(collection(db, "categories"), orderBy("displayOrder", "asc"), limit(8));
    const unsub = onSnapshot(q, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleShopEnter = () => {
    if (shopTimeoutRef.current) clearTimeout(shopTimeoutRef.current);
    setIsShopOpen(true);
  };

  const handleShopLeave = () => {
    shopTimeoutRef.current = setTimeout(() => {
      setIsShopOpen(false);
    }, 200);
  };

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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsShopOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

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
          <Link href="/" className="flex items-center">
            <Image
              src="/images/fathom-logo-transparent.png"
              alt="Fathom"
              width={160}
              height={45}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const isShop = link.text === "Shop";

              if (isShop) {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={handleShopEnter}
                    onMouseLeave={handleShopLeave}
                  >
                    <Link href={link.href} className="relative group text-sm font-semibold text-primary/80 hover:text-primary transition-colors tracking-[0.2em] uppercase flex items-center gap-1">
                      {link.text}
                      <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isShopOpen ? 'rotate-180' : ''}`} />
                      <span className={`absolute -bottom-1 left-0 h-[2px] bg-accent transition-all duration-300 ease-out origin-left ${isActive || isShopOpen ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                    </Link>


                  </div>
                );
              }

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
          <div className="flex items-center gap-4 md:gap-6">
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
            <Link href="/cart" className="relative text-primary hover:text-accent transition-colors magnet-button">
              <ShoppingBag className="w-5 h-5" />
              {items.length > 0 && (
                <span className="absolute -top-[6px] -right-[8px] w-4 h-4 bg-accent rounded-full text-[9px] text-white flex items-center justify-center font-bold">{items.length}</span>
              )}
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-primary hover:text-accent transition-colors p-1"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Shop Mega Menu Dropdown */}
      <AnimatePresence>
        {isShopOpen && categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed top-20 left-0 right-0 z-40 hidden md:block"
            onMouseEnter={handleShopEnter}
            onMouseLeave={handleShopLeave}
          >
            {/* Subtle top border accent line */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

            <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/80 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
              <div className="max-w-5xl mx-auto px-6 py-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-5 bg-[#D4AF37] rounded-full" />
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400">Shop by Category</span>
                  </div>
                  <Link 
                    href="/shop" 
                    onClick={() => setIsShopOpen(false)}
                    className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D4AF37] hover:text-primary transition-colors flex items-center gap-1"
                  >
                    View All Products
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Minimal Category List */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-8">
                  {categories.map((cat, index) => (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.3 }}
                    >
                      <Link
                        href={`/shop?category=${encodeURIComponent(cat.name || cat.title || '')}`}
                        onClick={() => setIsShopOpen(false)}
                        className="group flex items-center justify-between border-b border-gray-100 pb-3 hover:border-[#D4AF37] transition-colors duration-300"
                      >
                        <span className="text-xs font-semibold tracking-[0.15em] uppercase text-primary/80 group-hover:text-[#D4AF37] transition-colors duration-300">
                          {cat.name || cat.title || 'Category'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all duration-300" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-[55] md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl z-[56] md:hidden flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <span className="font-poppins font-bold text-lg tracking-widest text-primary uppercase">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-black transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="px-6 py-4 border-b border-gray-50">
                <div className="flex items-center relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      handleSearch(e);
                      if (e.key === "Enter") setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-gray-50 text-sm border border-gray-200 rounded-lg outline-none py-3 px-4 pr-10 placeholder-gray-400 focus:border-primary transition-colors"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute right-3 cursor-pointer" onClick={() => { if (searchQuery.trim()) { router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`); setSearchQuery(""); setIsMobileMenuOpen(false); }}} />
                </div>
              </div>

              {/* Nav Links */}
              <div className="flex-1 overflow-y-auto py-4">
                {navLinks.map((link, index) => {
                  const isActive = pathname === link.href;
                  const isShop = link.text === "Shop";

                  if (isShop) {
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {/* Shop link with expand arrow */}
                        <div className="flex items-center">
                          <Link
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex-1 flex items-center px-6 py-4 text-sm font-semibold tracking-[0.2em] uppercase transition-colors ${
                              isActive
                                ? "text-accent bg-accent/5 border-r-2 border-accent"
                                : "text-primary/80 hover:text-primary hover:bg-gray-50"
                            }`}
                          >
                            {link.text}
                          </Link>
                          <button
                            onClick={() => setIsMobileShopExpanded(!isMobileShopExpanded)}
                            className="px-4 py-4 text-gray-400 hover:text-accent transition-colors"
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isMobileShopExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                        
                        {/* Expandable categories */}
                        <AnimatePresence>
                          {isMobileShopExpanded && categories.length > 0 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden bg-gray-50/50"
                            >
                              {categories.map((cat) => (
                                <Link
                                  key={cat.id}
                                  href={`/shop?category=${encodeURIComponent(cat.name || cat.title || '')}`}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="flex items-center gap-3 px-8 py-3 text-xs font-semibold tracking-[0.15em] uppercase text-gray-500 hover:text-accent hover:bg-white/80 transition-colors"
                                >
                                  {/* Minimal mobile text list */}
                                  <span className="text-[13px]">{cat.name || cat.title || 'Category'}</span>
                                  <ChevronRight className="w-3 h-3 ml-auto opacity-40" />
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center px-6 py-4 text-sm font-semibold tracking-[0.2em] uppercase transition-colors ${
                          isActive
                            ? "text-accent bg-accent/5 border-r-2 border-accent"
                            : "text-primary/80 hover:text-primary hover:bg-gray-50"
                        }`}
                      >
                        {link.text}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Admin link for mobile — only for admin users */}
                {isAdmin && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navLinks.length * 0.05 }}
                  >
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold tracking-[0.2em] uppercase transition-colors ${
                        pathname?.startsWith('/admin')
                          ? "text-accent bg-accent/5 border-r-2 border-accent"
                          : "text-accent hover:text-primary hover:bg-gray-50"
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                      Admin
                    </Link>
                  </motion.div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-gray-100">
                {user ? (
                  <button
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-primary font-bold text-xs uppercase tracking-widest py-3 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-black text-white font-bold text-xs uppercase tracking-widest py-3 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
