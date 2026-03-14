"use client";

import { motion } from "framer-motion";

export default function FilterSidebar({
  maxPrice,
  setMaxPrice,
  inStockOnly,
  setInStockOnly,
  featuredOnly,
  setFeaturedOnly,
  bestSellerOnly,
  setBestSellerOnly
}: {
  maxPrice: number;
  setMaxPrice: (val: number) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  featuredOnly: boolean;
  setFeaturedOnly: (val: boolean) => void;
  bestSellerOnly: boolean;
  setBestSellerOnly: (val: boolean) => void;
}) {
  return (
    <aside className="w-full lg:w-64 flex flex-col gap-10 pr-8 mt-4 lg:sticky lg:top-32 lg:h-max">
      {/* Price Range */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 tracking-[0.2em] uppercase mb-4">Max Price: ₹{maxPrice.toLocaleString()}</h3>
        <input 
          type="range" 
          min="100" 
          max="500000" 
          step="500"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary" 
        />
        <div className="flex justify-between text-xs font-semibold text-primary mt-2">
          <span>₹100</span>
          <span>₹5,00,000</span>
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 tracking-[0.2em] uppercase mb-4">Availability</h3>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              className="hidden" 
              checked={inStockOnly} 
              onChange={(e) => setInStockOnly(e.target.checked)} 
            />
            <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${inStockOnly ? 'border-accent bg-accent text-white' : 'border border-gray-300 bg-white group-hover:border-primary'}`}>
              {inStockOnly && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <span className={`text-sm font-medium transition-colors ${inStockOnly ? 'text-primary' : 'text-gray-600 group-hover:text-primary'}`}>In Stock Only</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              className="hidden" 
              checked={featuredOnly} 
              onChange={(e) => setFeaturedOnly(e.target.checked)} 
            />
            <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${featuredOnly ? 'border-accent bg-accent text-white' : 'border border-gray-300 bg-white group-hover:border-primary'}`}>
              {featuredOnly && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <span className={`text-sm font-medium transition-colors ${featuredOnly ? 'text-primary' : 'text-gray-600 group-hover:text-primary'}`}>Featured Products</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              className="hidden" 
              checked={bestSellerOnly} 
              onChange={(e) => setBestSellerOnly(e.target.checked)} 
            />
            <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${bestSellerOnly ? 'border-accent bg-accent text-white' : 'border border-gray-300 bg-white group-hover:border-primary'}`}>
              {bestSellerOnly && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <span className={`text-sm font-medium transition-colors ${bestSellerOnly ? 'text-primary' : 'text-gray-600 group-hover:text-primary'}`}>Best Sellers</span>
          </label>
        </div>
      </div>
    </aside>
  );
}
