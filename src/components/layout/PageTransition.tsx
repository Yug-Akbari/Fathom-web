"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname} className="min-h-screen">
        {children}
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ scaleX: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }}
          style={{ originX: 0 }}
          className="fixed inset-0 z-[100] bg-primary"
        />
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 } }}
          exit={{ scaleX: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 } }}
          style={{ originX: 0 }}
          className="fixed inset-0 z-[101] bg-surface"
        />
      </motion.div>
    </AnimatePresence>
  );
}
