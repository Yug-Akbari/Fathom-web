"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import Link from "next/link";

export default function NotificationBell() {
  const [newLeadCount, setNewLeadCount] = useState(0);

  useEffect(() => {
    // Only query Firestore for Leads with status "New"
    const q = query(collection(db, "leads"), where("status", "==", "New"));
    const unsub = onSnapshot(q, (snapshot) => {
      setNewLeadCount(snapshot.docs.length);
    });
    return () => unsub();
  }, []);

  return (
    <Link href="/admin/leads" className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {newLeadCount > 0 && (
        <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
      )}
    </Link>
  );
}
