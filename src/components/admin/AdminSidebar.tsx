"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";
import { 
  LayoutDashboard, 
  PackageSearch, 
  Users, 
  HelpCircle,
  LogOut,
  Calculator,
  Grid,
  ExternalLink,
  Receipt
} from "lucide-react";

const mainNavItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/inventory", icon: PackageSearch },
  { name: "Categories", href: "/admin/categories", icon: Grid },
  { name: "Leads", href: "/admin/leads", icon: Users },
  { name: "Invoices", href: "/admin/invoices", icon: Receipt },
  { name: "Accounting", href: "/admin/accounting", icon: Calculator },
];

export default function AdminSidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Admin";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <aside className={`bg-primary flex flex-col h-full border-r border-[#222222] ${className}`}>
      {/* Brand Header */}
      <div className="h-20 flex items-center px-8 border-b border-[#222222] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-accent rounded-sm transform rotate-45"></div>
          <span className="font-poppins font-bold text-xl tracking-widest text-white uppercase">
            Fathom
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-8 flex flex-col gap-2 overflow-y-auto w-full relative">
        <div className="px-8 mb-4">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">Main Menu</span>
        </div>

        <ul className="flex flex-col w-full relative">
          {mainNavItems.map((item, i) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.name} className="relative w-full">
                <Link 
                  href={item.href}
                  className={`flex items-center gap-4 px-8 py-3 w-full transition-colors relative z-10 ${
                    isActive ? "text-accent" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className="flex items-center gap-4 w-full"
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="font-semibold text-sm tracking-wide">{item.name}</span>
                  </motion.div>
                </Link>
                
                {/* Active State Background & Indicator (Shared Layout Transition) */}
                {isActive && (
                  <motion.div
                    layoutId="active-sidebar-bg"
                    className="absolute inset-0 bg-white/5 border-l-4 border-accent z-0"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </li>
            );
          })}
        </ul>

        {/* Support Section */}
        <div className="px-8 mt-12 mb-4">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">Support</span>
        </div>
        <ul className="flex flex-col w-full">
          <li className="w-full">
            <Link 
              href="/admin/help"
              className="flex items-center gap-4 px-8 py-3 text-gray-400 hover:text-white transition-colors"
            >
              <HelpCircle className="w-5 h-5 shrink-0" />
            </Link>
          </li>
          <li className="w-full">
            <Link 
              href="/"
              className="flex items-center gap-4 px-8 py-3 text-gray-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-5 h-5 shrink-0" />
              <span className="font-semibold text-sm tracking-wide">Back to Site</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* User Footer */}
      <div className="p-6 border-t border-[#222222] shrink-0 mt-auto">
        <div className="flex items-center gap-4 w-full text-left group">
          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700 overflow-hidden">
             {user?.photoURL ? (
               <Image src={user.photoURL} alt={displayName} width={40} height={40} className="rounded-full object-cover" />
             ) : (
               <span className="text-sm font-bold text-accent">{initials}</span>
             )}
          </div>
          <div className="flex flex-col truncate flex-1">
            <span className="text-sm font-bold text-white truncate">{displayName}</span>
            <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-gray-400 truncate">{isAdmin ? "Admin" : "User"}</span>
          </div>
          <button onClick={handleLogout} title="Logout">
            <LogOut className="w-4 h-4 text-gray-600 hover:text-white transition-colors shrink-0" />
          </button>
        </div>
      </div>
    </aside>
  );
}
