import React from 'react';
import { motion } from 'framer-motion';
import { COMPANY_STATS } from '../../constants/homeData';

const StatsSection: React.FC = () => {
  return (
    <section className="py-20 bg-slate-900 text-white dark:bg-slate-950 border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Distinct Slate Dark Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {COMPANY_STATS.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex flex-col space-y-2 p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-brand-500/50 transition-all"
            >
              <span className="text-4xl sm:text-5xl font-heading font-black text-brand-500 tracking-tight">
                {stat.value}
              </span>
              <h4 className="text-lg font-bold text-white">
                {stat.label}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
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
