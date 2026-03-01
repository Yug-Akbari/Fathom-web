"use client";

import { motion } from "framer-motion";
import { LayoutGrid } from "lucide-react";



export default function CategoryPills({ 
  activeCategory, 
  setCategory,
  categories = []
}: { 
  activeCategory: string, 
  setCategory: (val: string) => void,
  categories?: any[]
}) {
  const dynamicCategories = [
    { id: "all", label: "All Products", icon: LayoutGrid },
    ...categories.map(c => ({
      id: c.name.toLowerCase(),
      label: c.name,
      icon: LayoutGrid // fallback icon
    }))
  ];
  return (
    <div className="flex overflow-x-auto pb-4 mb-8 -mx-6 px-6 lg:mx-0 lg:px-0 hide-scrollbar gap-4">
      {dynamicCategories.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory.toLowerCase() === cat.id.toLowerCase();

        return (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`relative px-6 py-3 rounded-full flex items-center gap-3 transition-colors duration-300 whitespace-nowrap ${
              isActive ? "text-white" : "text-gray-600 hover:text-primary bg-white shadow-sm"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activePill"
                className="absolute inset-0 bg-primary rounded-full shadow-md"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2 font-inter font-semibold text-sm">
              <Icon className="w-4 h-4" />
              {cat.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
