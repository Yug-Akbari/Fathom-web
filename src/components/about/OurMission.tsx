"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Shield, Heart, Zap } from "lucide-react";

const pillars = [
  {
    icon: Shield,
    title: "Uncompromising Quality",
    description: "Professional-grade engineering built to withstand the test of time, ensuring optimal performance for every culinary creation."
  },
  {
    icon: Heart,
    title: "Customer-Centric Innovation",
    description: "We design with our users in mind, continually refining our products to meet the evolving needs of passionate chefs and home cooks."
  },
  {
    icon: CheckCircle2,
    title: "Ethical Practices",
    description: "From sustainable manufacturing to transparent business operations, absolute integrity is at the core of everything we do."
  },
  {
    icon: Zap,
    title: "Culinary Excellence",
    description: "Empowering our customers to explore their creativity with tools that deliver precision, power, and flawless consistency."
  }
];

export default function OurMission() {
  return (
    <section className="w-full py-24 md:py-32 bg-white relative overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-accent font-bold tracking-[0.3em] uppercase text-sm mb-4 block">The Fathom Vision</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-primary mb-8">Our Mission</h2>
          
          <p className="text-lg md:text-xl text-primary/80 font-inter leading-relaxed max-w-3xl mx-auto">
            At FATHOM, we believe in elevating the culinary experience by providing professional-grade appliances for both home and commercial use. Our mission is to bridge the gap between industrial capability and home convenience, delivering high-quality products that enhance our customers' lives while maintaining the highest standards of service and integrity.
          </p>
        </motion.div>

        {/* Mission Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-20">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex flex-col gap-4 p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors duration-300 shadow-sm">
                <pillar.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-poppins font-bold text-primary mt-2">
                {pillar.title}
              </h3>
              <p className="text-gray-600 leading-relaxed font-inter text-sm md:text-base">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
