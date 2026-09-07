"use client";

import { useAuth } from "@/lib/AuthContext";
import Image from "next/image";

export default function AdminHeaderUser() {
  const { user, isAdmin } = useAuth();
  
  const displayName = user?.displayName || user?.email?.split("@")[0] || "Admin User";
  const initials = displayName.slice(0, 2).toUpperCase();
  const role = isAdmin ? "Super Admin" : "User";

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <div className="text-sm font-bold">{displayName}</div>
        <div className="text-[10px] text-gray-400 uppercase tracking-widest">{role}</div>
      </div>
      <div className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center font-poppins font-bold text-sm overflow-hidden">
        {user?.photoURL ? (
           <Image src={user.photoURL} alt={displayName} width={40} height={40} className="rounded-full object-cover" />
        ) : (
           initials
        )}
      </div>
    </div>
  );
}
