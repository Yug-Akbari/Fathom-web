"use client";

import { motion } from "framer-motion";

export default function SpecialistConnect() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
      className="bg-[#F9F9F9] rounded-2xl p-10 md:p-14 flex flex-col h-full"
    >
      <h3 className="text-2xl md:text-3xl font-poppins font-bold text-primary mb-2">Connect with a Specialist</h3>
      <p className="text-gray-500 font-inter mb-12">Immediate assistance for urgent project needs.</p>

      <div className="flex flex-col gap-10">
        
        {/* Contact Method 1 */}
        <div className="flex items-start gap-6 group cursor-pointer" onClick={() => window.open('https://wa.me/919173546159', '_blank')}>
          <div className="relative">
            <div className="absolute inset-0 bg-accent rounded-full hidden group-hover:block transition-all duration-300 group-hover:animate-pulse-ring"></div>
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white relative z-10 transition-transform duration-300 group-hover:scale-110">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-poppins font-bold text-primary text-lg group-hover:text-accent transition-colors">WhatsApp Enquiry</span>
            <span className="text-gray-500 font-inter text-sm">+91 91735 46159</span>
          </div>
        </div>



      </div>

      <div className="mt-16 pt-10 border-t border-gray-200 flex items-start gap-4">
        <div className="text-accent shrink-0 mt-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-2">Global Headquarters</span>
          <span className="text-gray-500 font-inter text-sm leading-relaxed mb-4">
            126, Green Plaza Shopping,<br />
            Mota Varachha, Surat,<br />
            Gujarat 394105
          </span>
          <span className="text-gray-500 font-inter text-sm mb-1">+91 91735 46159</span>
          <span className="text-gray-500 font-inter text-sm">kishucreation007@gmail.com</span>
        </div>
      </div>

    </motion.div>
  );
}
