"use client";

import { motion } from "framer-motion";
import { Shield, Heart, Sparkles } from "lucide-react";

export default function OurValues() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section className="w-full py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
        
        <div className="text-center max-w-3xl mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-primary mb-6"
          >
            Our Values
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-primary font-inter leading-relaxed"
          >
            These principles guide everything we do, from product selection to customer service.
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="h-1 w-16 bg-black mx-auto mt-8 origin-left"
          />
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full"
        >
          {/* Card 1 */}
          <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-8 lg:p-12 shadow-sm border border-gray-100 flex flex-col">
            <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center mb-8">
              <Shield className="w-5 h-5 text-primary" strokeWidth={2} />
            </div>
            <h3 className="text-2xl font-poppins font-bold text-primary mb-4">Quality First</h3>
            <p className="text-gray-500 font-inter leading-relaxed">
              We never compromise on the quality of our products and services.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-8 lg:p-12 shadow-sm border border-gray-100 flex flex-col">
            <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center mb-8">
              <Heart className="w-5 h-5 text-primary" strokeWidth={2} />
            </div>
            <h3 className="text-2xl font-poppins font-bold text-primary mb-4">Customer Focus</h3>
            <p className="text-gray-500 font-inter leading-relaxed">
              Our customers are at the heart of everything we do.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-8 lg:p-12 shadow-sm border border-gray-100 flex flex-col">
            <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center mb-8">
              <Sparkles className="w-5 h-5 text-primary" strokeWidth={2} />
            </div>
            <h3 className="text-2xl font-poppins font-bold text-primary mb-4">Innovation</h3>
            <p className="text-gray-500 font-inter leading-relaxed">
              We continuously innovate to bring you the best solutions.
            </p>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
