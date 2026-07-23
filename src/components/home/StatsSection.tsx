import React from 'react';
import { motion } from 'framer-motion';
import { COMPANY_STATS } from '../../constants/homeData';

const StatsSection: React.FC = () => {
  return (
    <section className="py-20 bg-brand-600 text-white border-y border-brand-500 shadow-2xl relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Solid Brand-Orange Banner with Crisp Pure White Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {COMPANY_STATS.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex flex-col space-y-2 p-7 rounded-2xl bg-white text-gray-900 border border-white/40 shadow-2xl hover:scale-[1.03] transition-all duration-300"
            >
              <span className="text-4xl sm:text-5xl font-heading font-black text-brand-600 tracking-tight">
                {stat.value}
              </span>
              <h4 className="text-lg font-bold text-gray-900">
                {stat.label}
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default StatsSection;
