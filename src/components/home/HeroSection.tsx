import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroBgVideo from '../../assets/videos/hero-bg.mp4';

const ROTATING_PHRASES = [
  'Ambitious Brands',
  'Scalable SaaS Platforms',
  'Growing Enterprises',
  'Modern Web Products',
];

const HeroSection: React.FC = () => {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full min-h-[85vh] flex items-center justify-center bg-gray-950 text-white overflow-hidden py-24">
      {/* Background HD Video Stream */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-45 scale-105"
        >
          <source src={heroBgVideo} type="video/mp4" />
        </video>
        {/* Overlay gradient for crisp high-contrast readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-gray-950/70 to-gray-950 z-10" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center">
        
        {/* Main Headline with Zero-Shift Dedicated Line Animation */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-heading font-black tracking-tight leading-[1.15] max-w-5xl mb-6 text-white"
        >
          We Build High-Impact Digital Solutions
          <span className="block mt-2 text-brand-500 min-h-[1.25em] relative">
            <AnimatePresence mode="wait">
              <motion.span
                key={ROTATING_PHRASES[wordIndex]}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="block"
              >
                For {ROTATING_PHRASES[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-base sm:text-xl text-gray-300 max-w-2xl font-normal leading-relaxed mb-10"
        >
          From high-converting web platforms to scalable SaaS architectures, we combine modern React development with strategic UI/UX design.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          <Link
            to="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base transition-all duration-200 shadow-lg shadow-brand-600/30 hover:-translate-y-0.5"
          >
            <span>Start a Project</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            to="/services"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base border border-white/15 transition-all duration-200 backdrop-blur-md"
          >
            <Code2 className="w-5 h-5 text-brand-400" />
            <span>Explore Services</span>
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;
