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
        className="relative rounded-3xl bg-brand-600 p-10 sm:p-20 overflow-hidden border border-brand-500 shadow-2xl text-white"
      >
        {/* Content Container */}
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-heading font-black text-white tracking-tight leading-tight mb-6">
            Ready to Accelerate Your Digital Growth?
          </h2>

          <p className="text-orange-100 text-base sm:text-lg mb-10 leading-relaxed max-w-2xl mx-auto font-medium">
            Partner with GM Digital Studio to build custom web platforms, scalable SaaS architectures, and high-impact digital experiences.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-slate-950 hover:bg-black text-white font-bold text-base transition-all duration-200 shadow-xl border border-white/20 hover:-translate-y-0.5"
            >
              <span>Schedule Consultation</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-white hover:bg-gray-100 text-gray-950 font-bold text-base border border-white transition-all duration-200 shadow-lg hover:-translate-y-0.5"
            >
              <MessageSquare className="w-5 h-5 text-gray-900" />
              <span>Send Us a Message</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
