import React from 'react';
import { FileText } from 'lucide-react';
import { motion } from 'framer-motion';

import termsBgVideo from '../assets/videos/terms-bg.mp4';

const Terms: React.FC = () => {
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
            <source src={termsBgVideo} type="video/mp4" />
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
            <FileText className="w-8 h-8" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl font-heading font-black tracking-tight mb-3 text-white"
          >
            Terms of Service
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Engagement & Services</h2>
            <p>
              GM Digital Studio provides digital software engineering, UI/UX design systems, cloud backend architecture, and workflow automation. All project engagements are governed by individual Statements of Work (SOW) detailing scope, deliverables, timelines, and payment terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Intellectual Property Rights</h2>
            <p>
              Upon final payment of all project invoices, GM Digital Studio assigns all rights, title, and ownership of custom code, design assets, and deliverables to the client. GM Digital Studio retains rights to pre-existing open-source frameworks and reusable utility libraries.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Client Responsibilities</h2>
            <p>
              Clients are responsible for providing timely feedback, assets, and required approvals during sprint reviews. Delays in providing necessary specifications may extend project delivery timelines.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Payment & Milestone Billing</h2>
            <p>
              Invoices are issued according to project milestone schedules. Payments are due within 14 calendar days of invoice date unless specified otherwise in the master service agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, GM Digital Studio shall not be liable for indirect, incidental, or consequential damages arising from service usage or software deployment.
            </p>
          </section>
        </div>
      </div>

    </div>
  );
};

export default Terms;
