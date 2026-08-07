import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

import privacyBgVideo from '../assets/videos/privacy-bg.mp4';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="w-full bg-white dark:bg-dark-bg text-gray-900 dark:text-white">
      
      {/* Hero Header with Relevant Ambient Video Loop */}
      <section className="py-20 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-50 scale-105"
          >
            <source src={privacyBgVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/75 via-gray-950/65 to-gray-950 z-10" />
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="p-3 rounded-2xl bg-brand-500/20 text-brand-400 w-fit mx-auto mb-4 border border-brand-500/30 backdrop-blur-md"
          >
            <ShieldCheck className="w-8 h-8" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl font-heading font-black tracking-tight mb-3 text-white"
          >
            Privacy Policy
          </motion.h1>
          <p className="text-sm text-gray-300 font-medium">
            Last Updated: July 22, 2026
          </p>
        </div>
      </section>

      {/* Content Box */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto p-8 sm:p-12 rounded-3xl bg-gray-50/80 dark:bg-dark-surface border border-gray-200/80 dark:border-dark-border space-y-8 text-sm leading-relaxed text-gray-700 dark:text-gray-300 shadow-sm">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Information We Collect</h2>
            <p>
              When you submit inquiries through GM Digital Studio, we collect personal information such as your name, email address, company name, requested services, and project requirements. We collect this data solely to communicate with you and provide tailored software engineering services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. How We Use Your Information</h2>
            <p>
              We use your information strictly to respond to project inquiries, issue service proposals, manage project milestones, process transactions, and send transactional system updates. We do not sell or rent your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Data Security & Storage</h2>
            <p>
              All client communications and database records are stored using encrypted PostgreSQL infrastructure via Supabase with strict Row-Level Security (RLS) policies. Access to internal project files is restricted to authorized project team members.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Cookies & Analytics</h2>
            <p>
              Our web platform uses essential cookies and anonymous performance metrics to optimize Core Web Vitals and user experience. You may manage your cookie preferences directly through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Contact Privacy Office</h2>
            <p>
              If you have any questions regarding our Privacy Policy or wish to request data updates, please contact our data privacy officer at <a href="mailto:privacy@gmdigitalstudio.app" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">privacy@gmdigitalstudio.app</a>.
            </p>
          </section>
        </div>
      </div>

    </div>
  );
};

export default PrivacyPolicy;
