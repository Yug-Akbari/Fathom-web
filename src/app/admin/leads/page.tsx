"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lead } from "@/lib/adminData";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";

export default function LeadManagement() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "leads"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
      // Sort by newest Date first
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setLeads(data);
    });
    return () => unsub();
  }, []);

  const updateLeadStatus = async (id: string, isRealDoc: boolean, newStatus: string) => {
    if (isRealDoc) {
      await updateDoc(doc(db, "leads", id), { status: newStatus });
    } else {
      setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus as any } : l));
    }
    
    // Update local selected state to instantly reflect on screen
    if (selectedLead && selectedLead.id === id) {
      setSelectedLead({...selectedLead, status: newStatus as any});
    }
  };

  // Close the panel on background click
  const handleClose = () => setSelectedLead(null);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-full relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-primary mb-2">Lead Management</h1>
          <p className="text-gray-500 font-inter text-sm">Manage inquiries from Studio and WhatsApp</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select className="bg-white border text-sm font-inter text-primary border-gray-200 py-2.5 px-4 rounded outline-none focus:border-accent">
            <option>All Roles</option>
            <option>Architect</option>
            <option>Designer</option>
            <option>Homeowner</option>
          </select>
          <select className="bg-white border text-sm font-inter text-primary border-gray-200 py-2.5 px-4 rounded outline-none focus:border-accent">
            <option>All Sources</option>
            <option>WhatsApp</option>
            <option>Web Form</option>
          </select>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#FAF9F6] border-b border-gray-100">
              <tr>
                <th className="py-4 px-6 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Date</th>
                <th className="py-4 px-6 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Name</th>
                <th className="py-4 px-6 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Role</th>
                <th className="py-4 px-6 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Source</th>
                <th className="py-4 px-6 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm font-inter">
              {leads.map((lead) => (
                <tr 
                  key={lead.id} 
                  onClick={() => setSelectedLead(lead)}
                  className={`border-b border-gray-50 cursor-pointer transition-colors ${selectedLead?.id === lead.id ? 'bg-accent/5 relative' : 'hover:bg-gray-50/50'}`}
                >
                  {/* Active highlight bar on the left */}
                  {selectedLead?.id === lead.id && (
                    <motion.td layoutId="active-lead" className="absolute left-0 top-0 bottom-0 w-1 bg-accent z-10" />
                  )}
                  
                  <td className="py-4 px-6 text-gray-500 whitespace-nowrap">{lead.date}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-primary truncate">{lead.name}</span>
                        <span className="text-xs text-gray-500 truncate">{lead.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-semibold">{lead.role}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      lead.source === 'WhatsApp' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {lead.source}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className={`font-bold ${lead.status === 'New' ? 'text-primary' : 'text-accent'}`}>
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Detail Panel overlay bg */}
      <AnimatePresence>
        {selectedLead && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            className="absolute inset-[-40px] bg-primary/20 backdrop-blur-[2px] z-40 hidden lg:block"
          />
        )}
      </AnimatePresence>

      {/* The Detail Panel */}
      <AnimatePresence>
        {selectedLead && (
          <motion.div 
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="absolute top-0 right-0 h-full w-full lg:w-[450px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.05)] border-l border-gray-100 z-50 flex flex-col p-8 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent mb-1 block">Inquiry Details</span>
                <h2 className="text-2xl font-poppins font-bold text-primary">{selectedLead.name}</h2>
              </div>
              <button onClick={handleClose} className="p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 block mb-1">Email</span>
                <a href={`mailto:${selectedLead.email}`} className="text-sm font-semibold text-primary hover:text-accent transition-colors">{selectedLead.email}</a>
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 block mb-1">Phone</span>
                <a href={`tel:${selectedLead.phone}`} className="text-sm font-semibold text-primary hover:text-accent transition-colors">{selectedLead.phone}</a>
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 block mb-1">Role</span>
                <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-semibold inline-block">{selectedLead.role}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 block mb-1">Company</span>
                <span className="text-sm font-inter text-primary">{selectedLead.company || '-'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 block mb-1">Location</span>
                <span className="text-sm font-inter text-primary">{selectedLead.location}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 block mb-1">Source</span>
                <span className="text-sm font-semibold text-accent flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Inquiry Studio
                </span>
              </div>
            </div>

            {/* Message Body */}
            <div className="mb-10">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 block mb-3">Message</span>
              <div className="bg-[#FAF9F6] p-5 rounded-lg border border-gray-100 text-sm font-inter text-gray-600 leading-relaxed whitespace-pre-wrap">
                {selectedLead.message}
              </div>
            </div>

            {/* Interested Products Reference */}
            <div className="mb-10">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 block mb-3">Interested Products</span>
              <div className="border border-gray-200 rounded-lg p-3 flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden shrink-0 relative">
                   <Image src="/images/espresso.png" alt="Product" fill className="object-cover" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-primary text-sm truncate">Obsidian Range 48"</span>
                  <span className="text-xs text-gray-500 font-mono mt-0.5">OBS-48-RNG</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto pt-6 flex flex-col gap-3">
              <a 
                href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello " + selectedLead.name + ",\n\nRegarding your inquiry...")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => updateLeadStatus(selectedLead.id, !selectedLead.id.startsWith("L-"), "Contacted")}
                className="w-full bg-[#1FAF38] hover:bg-[#1A9C31] text-white font-bold tracking-[0.1em] text-sm py-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-[0_4px_14px_rgba(31,175,56,0.25)]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Reply via WhatsApp
              </a>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => updateLeadStatus(selectedLead.id, !selectedLead.id.startsWith("L-"), "Pending")}
                  className="border border-gray-200 bg-white text-primary font-bold text-xs tracking-wider uppercase py-3 rounded-lg hover:border-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Mark Pending
                </button>
                <button 
                  onClick={() => updateLeadStatus(selectedLead.id, !selectedLead.id.startsWith("L-"), "Resolved")}
                  className="border border-gray-200 bg-white text-primary font-bold text-xs tracking-wider uppercase py-3 rounded-lg hover:border-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Mark Resolved
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
