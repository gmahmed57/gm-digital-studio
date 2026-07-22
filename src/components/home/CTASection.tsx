import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTASection: React.FC = () => {
  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl bg-gray-950 p-10 sm:p-20 overflow-hidden border border-brand-500/30 shadow-2xl"
      >
        {/* Background HD Video Stream */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-40 scale-105"
          >
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-circuit-board-digital-animation-41565-large.mp4"
              type="video/mp4"
            />
          </video>
          {/* Dark Overlay gradient for crisp high-contrast readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/85 to-gray-950/70" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-heading font-black text-white tracking-tight leading-tight mb-6">
            Ready to Accelerate Your <span className="text-brand-500">Digital Growth</span>?
          </h2>

          <p className="text-gray-300 text-base sm:text-lg mb-10 leading-relaxed max-w-2xl mx-auto font-normal">
            Partner with GM Studio to build custom web platforms, scalable SaaS architectures, and high-impact digital experiences.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base transition-all duration-200 shadow-lg shadow-brand-600/30 hover:-translate-y-0.5"
            >
              <span>Schedule Consultation</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base border border-white/15 transition-all duration-200 backdrop-blur-md"
            >
              <MessageSquare className="w-4 h-4 text-brand-400" />
              <span>Send Us a Message</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
