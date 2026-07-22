import React from 'react';
import { motion } from 'framer-motion';
import { COMPANY_LOGOS } from '../../constants/homeData';

const LogoMarquee: React.FC = () => {
  const marqueeItems = [...COMPANY_LOGOS, ...COMPANY_LOGOS, ...COMPANY_LOGOS, ...COMPANY_LOGOS];

  return (
    <div className="w-full overflow-hidden py-6 bg-gray-900 dark:bg-black text-white relative border-y border-gray-800">
      <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-gray-900 dark:from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-gray-900 dark:from-black to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex items-center gap-12 whitespace-nowrap"
        animate={{ x: ['-50%', '0%'] }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: 25,
        }}
      >
        {marqueeItems.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/10"
          >
            <img src={item.logoUrl} alt={item.name} className="h-6 w-auto object-contain invert" />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default LogoMarquee;
