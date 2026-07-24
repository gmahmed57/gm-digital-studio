import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { COMPANY_STATS } from '../../constants/homeData';

interface CountUpProps {
  rawTarget: string;
}

const CountUpNumber: React.FC<CountUpProps> = ({ rawTarget }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState('1');

  // Parse numeric target, decimals, prefix, suffix
  const match = rawTarget.match(/^([^\d.]*)(\d+(?:\.\d+)?)(.*)$/);
  const prefix = match ? match[1] : '';
  const numTarget = match ? parseFloat(match[2]) : 0;
  const suffix = match ? match[3] : rawTarget;
  const decimals = match && match[2].includes('.') ? match[2].split('.')[1].length : 0;

  useEffect(() => {
    if (!isInView || numTarget === 0) return;

    let startTimestamp: number | null = null;
    const startVal = 1;
    const durationMs = 2000; // 2 seconds

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (numTarget - startVal) * easeProgress;

      setDisplayValue(current.toFixed(decimals));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(numTarget.toFixed(decimals));
      }
    };

    requestAnimationFrame(step);
  }, [isInView, numTarget, decimals]);

  return (
    <span ref={ref}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};

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
                <CountUpNumber rawTarget={stat.value} />
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
