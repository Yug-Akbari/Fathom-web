"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");

  return (
    <motion.form 
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className="flex flex-col gap-10 w-full"
    >
      {/* Name Input */}
      <div className="flex flex-col gap-2 relative group focus-within:text-primary">
        <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 group-focus-within:text-accent transition-colors">
          Full Name
        </label>
        <div className="relative">
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full bg-transparent border-b border-gray-200 py-3 text-lg font-inter text-primary placeholder:text-gray-300 focus:outline-none transition-colors"
          />
          {/* Animated Gold Bottom Border on Focus */}
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent origin-center scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 ease-out" />
        </div>
      </div>

      {/* Email Input */}
      <div className="flex flex-col gap-2 relative group focus-within:text-primary">
        <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 group-focus-within:text-accent transition-colors">
          Email Address
        </label>
        <div className="relative">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="w-full bg-transparent border-b border-gray-200 py-3 text-lg font-inter text-primary placeholder:text-gray-300 focus:outline-none transition-colors"
          />
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent origin-center scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 ease-out" />
        </div>
      </div>

      {/* Phone Input */}
      <div className="flex flex-col gap-2 relative group focus-within:text-primary mt-4">
        <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 group-focus-within:text-accent transition-colors">
          Phone Number
        </label>
        <div className="relative">
          <input 
            type="tel" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 234 567 8900"
            className="w-full bg-transparent border-b border-gray-200 py-3 text-lg font-inter text-primary placeholder:text-gray-300 focus:outline-none transition-colors"
          />
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent origin-center scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 ease-out" />
        </div>
      </div>

      {/* Category Input */}
      <div className="flex flex-col gap-2 relative group focus-within:text-primary mt-4">
        <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 group-focus-within:text-accent transition-colors">
          Category
        </label>
        <div className="relative">
          <input 
            type="text" 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Refrigeration, Cooking, etc."
            className="w-full bg-transparent border-b border-gray-200 py-3 text-lg font-inter text-primary placeholder:text-gray-300 focus:outline-none transition-colors"
          />
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent origin-center scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 ease-out" />
        </div>
      </div>

      {/* Message Input */}
      <div className="flex flex-col gap-2 relative group focus-within:text-primary mt-4">
        <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 group-focus-within:text-accent transition-colors">
          Message
        </label>
        <div className="relative">
          <textarea 
            placeholder="Tell us about your project requirements..."
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-transparent border-b border-gray-200 py-3 text-lg font-inter text-primary placeholder:text-gray-300 focus:outline-none transition-colors resize-none"
          />
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent origin-center scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 ease-out" />
        </div>
      </div>

      <div className="pt-8">
        {isSuccess ? (
          <div className="w-full bg-green-50 text-green-700 py-5 px-8 flex justify-center items-center rounded border border-green-200 font-bold tracking-[0.1em] text-sm uppercase">
            Inquiry Received
          </div>
        ) : (
          <button 
            type="button"
            onClick={async () => {
              if (!name || !email || !phone || !category || !message) return alert("Please fill all fields.");
              setIsSubmitting(true);
              try {
                await addDoc(collection(db, "leads"), {
                  name,
                  email,
                  phone,
                  category,
                  location: "Web Submssion",
                  source: "Web Form",
                  date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                  status: "New",
                  message,
                  interestedProductIds: [],
                  createdAt: new Date().toISOString()
                });
                setIsSuccess(true);
                setName("");
                setEmail("");
                setPhone("");
                setCategory("");
                setMessage("");
              } catch (error) {
                console.error(error);
                alert("Failed to submit. Please ensure Firebase Firestore Rules allow writes.");
              } finally {
                setIsSubmitting(false);
              }
            }}
            disabled={isSubmitting}
            className={`group w-full text-white py-5 px-8 flex justify-between items-center transition-all duration-300 ${isSubmitting ? 'bg-gray-400' : 'bg-primary hover:bg-black hover:scale-[1.01]'}`}
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase">{isSubmitting ? "Submitting..." : "Submit Inquiry"}</span>
            {!isSubmitting && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform transition-transform duration-300 group-hover:translate-x-2">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        )}
      </div>

    </motion.form>
  );
}
