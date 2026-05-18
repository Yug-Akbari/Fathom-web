"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Edit2, Globe, Calendar, Package, DollarSign, MapPin, Phone, User, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, doc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

interface Customer {
  id: string;
  name: string;
  phone: string;
  location: string;
  platformSource: string;
  billDate: string;
  purchasedModel: string;
  transactionValue: string;
  deliveryAddress: string;
  customerNotes: string;
  createdAt: any;
}

export default function CustomerDirectory() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    platformSource: "Direct Website",
    billDate: "",
    purchasedModel: "",
    transactionValue: "",
    deliveryAddress: "",
    customerNotes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch customers
  useEffect(() => {
    const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
      setCustomers(fetched);
      
      // Update selected customer if it exists in new data
      if (selectedCustomer) {
        const updated = fetched.find(c => c.id === selectedCustomer.id);
        if (updated) setSelectedCustomer(updated);
        else setSelectedCustomer(null);
      } else if (fetched.length > 0 && !selectedCustomer) {
        setSelectedCustomer(fetched[0]);
      }
    });
    return () => unsub();
  }, [selectedCustomer]);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.purchasedModel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        phone: customer.phone || "",
        location: customer.location || "",
        platformSource: customer.platformSource || "Direct Website",
        billDate: customer.billDate || "",
        purchasedModel: customer.purchasedModel || "",
        transactionValue: customer.transactionValue || "",
        deliveryAddress: customer.deliveryAddress || "",
        customerNotes: customer.customerNotes || ""
      });
      setEditingId(customer.id);
    } else {
      setFormData({
        name: "",
        phone: "",
        location: "",
        platformSource: "Direct Website",
        billDate: new Date().toISOString().split('T')[0],
        purchasedModel: "",
        transactionValue: "",
        deliveryAddress: "",
        customerNotes: ""
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "customers", editingId), formData);
      } else {
        const docRef = await addDoc(collection(db, "customers"), {
          ...formData,
          createdAt: serverTimestamp()
        });
        const newCustomer = { id: docRef.id, ...formData, createdAt: new Date() } as Customer;
        setSelectedCustomer(newCustomer);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving customer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;
    if (confirm("Are you sure you want to delete this customer? This action cannot be undone.")) {
      setIsSubmitting(true);
      try {
        await deleteDoc(doc(db, "customers", editingId));
        setIsModalOpen(false);
        setSelectedCustomer(null);
      } catch (error) {
        console.error("Error deleting customer:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col font-inter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-primary mb-1">Customer Directory</h1>
          <p className="text-gray-500 text-sm">Manage customer profiles, view history, and update contact details.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#c89837] hover:bg-[#b0842a] text-white rounded-full text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Customer
        </button>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* Left Panel: Customer List */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden shrink-0">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-lg text-primary mb-4">All Customers</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-all"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">
                No customers found.
              </div>
            ) : (
              filteredCustomers.map(customer => (
                <button
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedCustomer?.id === customer.id 
                      ? "bg-[#faf8f2] border-[#D4AF37] shadow-sm relative" 
                      : "bg-white border-transparent hover:border-gray-200"
                  }`}
                >
                  {selectedCustomer?.id === customer.id && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#D4AF37] rounded-r-full" />
                  )}
                  <h3 className="font-bold text-primary mb-1">{customer.name}</h3>
                  <div className="text-xs text-gray-500 mb-1">Model: <span className="font-medium text-gray-700">{customer.purchasedModel || "N/A"}</span></div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone className="w-3 h-3" />
                    {customer.phone || "No phone"}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Customer Details */}
        <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-y-auto relative">
          {selectedCustomer ? (
            <div className="p-8">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-10 pb-8 border-b border-gray-100">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-[#D4AF37] text-white rounded-full flex items-center justify-center text-2xl font-bold font-poppins shadow-md">
                    {getInitials(selectedCustomer.name || "?")}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-poppins text-primary mb-2">{selectedCustomer.name}</h2>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4" />
                        {selectedCustomer.phone || "No phone"}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {selectedCustomer.location || "No location"}
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleOpenModal(selectedCustomer)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-semibold transition-colors shrink-0"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Details
                </button>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-500 mb-2">Platform Source</h4>
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 p-4 rounded-xl">
                    <Globe className="w-5 h-5 text-[#c89837]" />
                    <span className="font-semibold text-primary">{selectedCustomer.platformSource || "—"}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-500 mb-2">Bill Date</h4>
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 p-4 rounded-xl">
                    <Calendar className="w-5 h-5 text-[#c89837]" />
                    <span className="font-semibold text-primary">
                      {selectedCustomer.billDate ? new Date(selectedCustomer.billDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "—"}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-500 mb-2">Purchased Model</h4>
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 p-4 rounded-xl">
                    <Package className="w-5 h-5 text-[#c89837]" />
                    <span className="font-semibold text-primary">{selectedCustomer.purchasedModel || "—"}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-500 mb-2">Transaction Value</h4>
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 p-4 rounded-xl">
                    <DollarSign className="w-5 h-5 text-[#c89837]" />
                    <span className="font-semibold text-primary">{selectedCustomer.transactionValue || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mb-8">
                <h4 className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-500 mb-2">Delivery Address</h4>
                <div className="bg-gray-50 border border-gray-100 p-5 rounded-xl font-medium text-gray-700 whitespace-pre-wrap">
                  {selectedCustomer.deliveryAddress || <span className="text-gray-400 italic">No delivery address provided</span>}
                </div>
              </div>

              {/* Notes */}
              <div>
                <h4 className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-500 mb-2">Customer Notes</h4>
                <div className="bg-gray-50 border border-gray-100 p-5 rounded-xl font-medium text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedCustomer.customerNotes || <span className="text-gray-400 italic">No notes available</span>}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
              <User className="w-16 h-16 mb-4 opacity-20" />
              <h3 className="text-xl font-poppins font-bold text-gray-900 mb-2">No Customer Selected</h3>
              <p className="text-sm">Select a customer from the directory or create a new one to view details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                <h2 className="text-xl font-poppins font-bold text-primary">
                  {editingId ? "Edit Customer Details" : "Add New Customer"}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="overflow-y-auto p-6 flex-1">
                <form id="customer-form" onSubmit={handleSaveCustomer} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 tracking-wider">FULL NAME *</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                        placeholder="e.g. Eleanor Vance"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 tracking-wider">PHONE NUMBER</label>
                      <input 
                        type="text" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                        placeholder="e.g. +1 (555) 019-2834"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 tracking-wider">SHORT LOCATION</label>
                      <input 
                        type="text" 
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                        placeholder="e.g. Seattle, WA"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 tracking-wider">BILL DATE</label>
                      <input 
                        type="date" 
                        value={formData.billDate}
                        onChange={(e) => setFormData({...formData, billDate: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 tracking-wider">PURCHASED MODEL</label>
                      <input 
                        type="text" 
                        value={formData.purchasedModel}
                        onChange={(e) => setFormData({...formData, purchasedModel: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                        placeholder="e.g. FTH-902-PRO"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 tracking-wider">TRANSACTION VALUE</label>
                      <input 
                        type="text" 
                        value={formData.transactionValue}
                        onChange={(e) => setFormData({...formData, transactionValue: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                        placeholder="e.g. $4,250.00 or ₹3,50,000"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-gray-500 tracking-wider">PLATFORM SOURCE</label>
                      <input 
                        type="text" 
                        value={formData.platformSource}
                        onChange={(e) => setFormData({...formData, platformSource: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                        placeholder="e.g. Direct Website, Amazon FBA, Offline Studio"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 tracking-wider">DELIVERY ADDRESS</label>
                    <textarea 
                      rows={3}
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] resize-none"
                      placeholder="Enter full delivery address..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 tracking-wider">CUSTOMER NOTES</label>
                    <textarea 
                      rows={4}
                      value={formData.customerNotes}
                      onChange={(e) => setFormData({...formData, customerNotes: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] resize-none"
                      placeholder="Add any specific requirements, delivery instructions, or history..."
                    />
                  </div>

                </form>
              </div>

              <div className="p-6 border-t border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
                {editingId ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="text-red-500 hover:text-red-700 text-sm font-semibold transition-colors"
                  >
                    Delete Customer
                  </button>
                ) : (
                  <div></div>
                )}
                
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    form="customer-form"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#c5a130] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : editingId ? "Save Changes" : "Create Customer"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
