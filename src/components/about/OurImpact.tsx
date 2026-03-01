"use client";

import { motion } from "framer-motion";

export default function OurImpact() {
  const stats = [
    { value: "2500+", label: "Happy Customers" },
    { value: "4000+", label: "Products Sold" },
    { value: "5+", label: "Years Experience" },
    { value: "24/7", label: "Support Available" },
  ];

  return (
    <section className="w-full py-24 bg-white px-6">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto bg-primary rounded-[32px] py-16 px-8 md:px-16 flex flex-col items-center shadow-2xl"
      >
        <h2 className="text-2xl md:text-3xl font-poppins font-bold text-white mb-16">Our Impact</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 w-full text-center divide-x-0 md:divide-x divide-white/10">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 + 0.3 }}
              className="flex flex-col items-center justify-center gap-3 px-4"
            >
              <div className="text-4xl md:text-5xl font-poppins font-bold text-white tracking-tight">{stat.value}</div>
              <div className="text-sm font-bold tracking-wide text-white">{stat.label}</div>
              <div className="h-[2px] w-8 bg-gray-500 mt-2"></div>
            </motion.div>
          ))}
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-gray-400 font-inter text-sm md:text-base mt-16 max-w-2xl text-center"
        >
          These numbers represent our commitment to excellence and the trust our customers place in us every day.
        </motion.p>

      </motion.div>
    </section>
  );
}
