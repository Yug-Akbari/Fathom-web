"use client";

import { motion } from "framer-motion";

export default function FilterSidebar({
  maxPrice,
  setMaxPrice,
  finish,
  setFinish,
  inStockOnly,
  setInStockOnly
}: {
  maxPrice: number;
  setMaxPrice: (val: number) => void;
  finish: string | null;
  setFinish: (val: string | null) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
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

      {/* Filter by Finish */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 tracking-[0.2em] uppercase mb-4">Filter by Finish</h3>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setFinish(finish === 'cream' ? null : 'cream')}
            className={`w-6 h-6 rounded-full bg-[#E8E8E8] border transition-all ${finish === 'cream' ? 'ring-2 ring-accent ring-offset-2 border-transparent' : 'border-gray-300'}`}
            title="Cream"
          ></button>
          <button 
            onClick={() => setFinish(finish === 'obsidian' ? null : 'obsidian')}
            className={`w-6 h-6 rounded-full bg-[#111111] border transition-all ${finish === 'obsidian' ? 'ring-2 ring-accent ring-offset-2 border-transparent' : 'border-gray-900'}`}
            title="Obsidian"
          ></button>
          <button 
            onClick={() => setFinish(finish === 'slate' ? null : 'slate')}
            className={`w-6 h-6 rounded-full bg-[#6B6B6B] border transition-all ${finish === 'slate' ? 'ring-2 ring-accent ring-offset-2 border-transparent' : 'border-gray-600'}`}
            title="Slate"
          ></button>
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
              onChange={() => setInStockOnly(!inStockOnly)} 
            />
            <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${inStockOnly ? 'border-accent bg-accent text-white' : 'border border-gray-300 bg-white group-hover:border-primary'}`}>
              {inStockOnly && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <span className={`text-sm font-medium transition-colors ${inStockOnly ? 'text-primary' : 'text-gray-600 group-hover:text-primary'}`}>In Stock Only</span>
          </label>
        </div>
      </div>
    </aside>
  );
}
