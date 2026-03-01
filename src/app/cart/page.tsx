"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import { Trash2, ShoppingBag, MessageCircle, ArrowLeft } from "lucide-react";

const WHATSAPP_NUMBER = "919173546159";

export default function CartPage() {
  const { items, removeItem, clearCart } = useCart();

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  const sendWhatsAppInquiry = () => {
    const productList = items.map((item, i) => `${i + 1}. ${item.name} - ₹${item.price.toLocaleString('en-IN')}`).join('\n');
    const message = `Hello FATHOM,\n\nI'm interested in the following products:\n\n${productList}\n\nEstimated Total: ₹${subtotal.toLocaleString('en-IN')}\n\nPlease share more details and availability.`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-background min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="mb-12">
          <Link href="/shop" className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-gray-400 hover:text-primary transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
          <h1 className="text-4xl md:text-5xl font-poppins font-bold text-primary mb-2">
            Luxury Inquiry Cart
          </h1>
          <p className="text-gray-500 text-sm md:text-base font-inter">
            Review your selected products and send an inquiry via WhatsApp.
          </p>
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-8">
              <ShoppingBag className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-poppins font-bold text-primary mb-3">Your cart is empty</h2>
            <p className="text-gray-500 text-sm font-inter mb-8 max-w-sm">Explore our collection and add products to your inquiry cart to get started.</p>
            <Link href="/shop" className="bg-primary text-white px-10 py-4 font-bold text-xs tracking-[0.2em] uppercase hover:bg-black transition-colors">
              Browse Collection
            </Link>
          </motion.div>
        ) : (
          /* Cart Content */
          <div className="flex flex-col lg:flex-row gap-12">

            {/* Left — Cart Items */}
            <div className="flex-1">
              <div className="flex flex-col gap-6">
                {items.map((item, idx) => (
                  <motion.div 
                    key={item.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex gap-6"
                  >
                    {/* Product Image */}
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-50 rounded-xl overflow-hidden relative shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-contain p-3" />
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col flex-1 justify-between py-1">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-poppins font-bold text-lg text-primary leading-tight max-w-[65%]">{item.name}</h3>
                          <span className="font-poppins font-bold text-lg text-accent whitespace-nowrap">₹{item.price.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Clear All */}
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={clearCart}
                  className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 hover:text-red-500 transition-colors"
                >
                  Clear All Items
                </button>
              </div>
            </div>

            {/* Right — Inquiry Summary */}
            <div className="w-full lg:w-[380px] shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sticky top-32">
                <h2 className="font-poppins font-bold text-xl text-primary mb-8">Inquiry Summary</h2>

                <div className="flex flex-col gap-4 text-sm font-inter">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-semibold text-primary">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Estimated Shipping</span>
                    <span className="font-semibold text-gray-400">TBD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax (Estimated)</span>
                    <span className="font-semibold text-gray-400">Calculated at Quote</span>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-2">
                    <div className="flex justify-between items-end">
                      <span className="font-poppins font-bold text-primary">Estimated Total</span>
                      <div className="text-right">
                        <span className="font-poppins font-bold text-2xl text-accent">₹{subtotal.toLocaleString('en-IN')}*</span>
                        <p className="text-[10px] text-gray-400 mt-1">*Excludes installation & custom delivery</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-3 mt-8">
                  <button 
                    onClick={sendWhatsAppInquiry}
                    className="w-full bg-accent hover:bg-[#b5952f] text-white font-bold tracking-[0.1em] text-sm py-4 rounded-lg flex items-center justify-center gap-3 transition-colors shadow-lg"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Inquire via WhatsApp
                  </button>

                  <Link 
                    href="/contact"
                    className="w-full bg-primary hover:bg-black text-white font-bold tracking-[0.1em] text-sm py-4 rounded-lg flex items-center justify-center gap-3 transition-colors text-center"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Request Formal Quote
                  </Link>
                </div>

                {/* Concierge Note */}
                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-500 font-inter leading-relaxed">
                    Our Design Concierge team is available to verify compatibility and installation requirements for your selections before finalizing your order.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
