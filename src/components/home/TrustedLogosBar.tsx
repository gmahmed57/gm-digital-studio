import React from 'react';
import { motion } from 'framer-motion';
import { COMPANY_LOGOS } from '../../constants/homeData';

const TrustedLogosBar: React.FC = () => {
  return (
    <section className="py-12 bg-gray-50/80 dark:bg-dark-surface/50 border-b border-gray-200/80 dark:border-dark-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Heading */}
        <div className="text-center mb-8">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Trusted by Industry Leaders & Innovative Global Brands
          </h3>
        </div>

        {/* Cohesive Logos Cluster (Icon + Name) */}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-85 hover:opacity-100 transition-opacity">
          {COMPANY_LOGOS.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="flex items-center gap-2.5 px-3 py-1.5 transition-all duration-300"
            >
              <img
                src={company.logoUrl}
                alt={`${company.name} Logo`}
                className="h-5 w-5 object-contain"
              />
              <span className="font-heading font-bold text-base tracking-tight text-gray-900 dark:text-white">
                {company.name}
              </span>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TrustedLogosBar;
