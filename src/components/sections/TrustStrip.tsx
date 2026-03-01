"use client";

import { motion } from "framer-motion";
import { Shield, Truck, Award } from "lucide-react";

const features = [
  {
    icon: Award,
    title: "Top Rated Brand",
    description: "Trusted by Michelin-star chefs worldwide for consistency.",
  },
  {
    icon: Truck,
    title: "Free Global Shipping",
    description: "Complimentary expedited delivery on all orders over ₹500.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export default function TrustStrip() {
  return (
    <section className="bg-black py-24 relative overflow-hidden">
      {/* Subtle Dot Grid Texture */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      ></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-4xl md:text-5xl font-poppins font-bold text-white mb-16"
        >
          Why Choose <span className="text-accent">FATHOM</span>
        </motion.h2>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-12 text-center max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={index} variants={itemVariants} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border border-accent/40 flex items-center justify-center mb-6 text-accent bg-accent/5">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
