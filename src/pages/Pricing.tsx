import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Sparkles, Cpu, Layout, Smartphone, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { SERVICE_PRICING_CATEGORIES } from '../constants/portfolioData';

interface MatrixRow {
  name: string;
  starter: string;
  scale: string;
  enterprise: string;
}

const SERVICE_FEATURE_MATRICES: Record<string, { title: string; rows: MatrixRow[] }> = {
  'web-dev': {
    title: 'Web & SaaS Development Feature Matrix',
    rows: [
      { name: 'Custom React / Next.js Pages', starter: 'Up to 5 Pages', scale: 'Up to 12 Pages', enterprise: 'Unlimited Pages' },
      { name: 'Mobile-First Responsive Layouts', starter: 'Included', scale: 'Included', enterprise: 'Advanced Multi-Breakpoints' },
      { name: 'Core Web Vitals Speed Score', starter: '90+ Score', scale: '98+ Score', enterprise: '99+ Guaranteed SLA' },
      { name: 'Supabase Database & Auth', starter: 'Optional Add-on', scale: 'Included', enterprise: 'High-Concurrency Cluster' },
      { name: 'Row Level Security (RLS)', starter: '—', scale: 'Included', enterprise: 'Enterprise Audit' },
      { name: 'Resend Email API Integration', starter: 'Included', scale: 'Included', enterprise: 'Custom Email Pipelines' },
      { name: 'Post-Launch Support', starter: '2 Weeks', scale: '30 Days', enterprise: 'Ongoing SLA Retainer' },
    ],
  },
  'ui-ux': {
    title: 'UI/UX & Design Systems Feature Matrix',
    rows: [
      { name: 'Figma UI Component Count', starter: '50+ Components', scale: '100+ Tokenized', enterprise: 'Full System Library' },
      { name: 'Tokenized Color & Type Variables', starter: 'Basic Variables', scale: 'Complete Tokens', enterprise: 'Multi-Brand System' },
      { name: 'Light & Dark Mode Tokens', starter: 'Basic', scale: 'Complete Mapping', enterprise: 'Dynamic Theme Tokens' },
      { name: 'Interactive Wireframes & Prototypes', starter: 'Desktop Views', scale: 'Desktop + Mobile', enterprise: 'Micro-Animations & Specs' },
      { name: 'Usability & Conversion Audits', starter: 'Standard Review', scale: 'Comprehensive Audit', enterprise: 'Full CRO Strategy' },
      { name: 'Storybook Developer Handoff', starter: '—', scale: 'Included', enterprise: 'Enterprise Documentation' },
    ],
  },
  'ai-automation': {
    title: 'AI & Workflow Automation Feature Matrix',
    rows: [
      { name: 'Webhook & API Connectors', starter: 'Up to 3 Integrations', scale: 'Up to 10 Integrations', enterprise: 'Unlimited API Pipelines' },
      { name: 'Automated Data Sync Speed', starter: '< 1s Sync', scale: '< 200ms Instant Sync', enterprise: 'Real-Time Stream' },
      { name: 'Supabase Edge Functions', starter: 'Basic Logic', scale: 'Advanced Edge Logic', enterprise: 'Custom Python / Deno' },
      { name: 'Resend Email Triggers', starter: 'Included', scale: 'Included', enterprise: 'Custom Templates & Webhooks' },
      { name: 'Error Logging & Telemetry Alerts', starter: 'Email Alerts', scale: 'Webhook Alerts', enterprise: 'Dedicated Telemetry' },
    ],
  },
  'mobile-dev': {
    title: 'Cross-Platform Mobile Apps Feature Matrix',
    rows: [
      { name: 'iOS & Android Codebase', starter: 'React Native', scale: 'React Native Expo', enterprise: 'Native Modular Squad' },
      { name: 'Offline Data Caching & Sync', starter: 'Basic Storage', scale: 'Full Offline Sync', enterprise: 'High-Concurrency Sync' },
      { name: 'Push Notifications Infrastructure', starter: 'Basic Alerts', scale: 'Segmented Push', enterprise: 'Custom APNS / FCM' },
      { name: 'Device Native Features', starter: 'Camera / GPS', scale: 'Full Hardware Sensors', enterprise: 'Custom Native Modules' },
      { name: 'Store Publishing Support', starter: 'App Store Submission', scale: 'App Store + Play Store', enterprise: 'Guaranteed Approval SLA' },
    ],
  },
};

const categoryIcons: Record<string, React.ReactNode> = {
  'web-dev': <Code2 className="w-4 h-4" />,
  'ui-ux': <Layout className="w-4 h-4" />,
  'ai-automation': <Cpu className="w-4 h-4" />,
  'mobile-dev': <Smartphone className="w-4 h-4" />,
};

const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [selectedServiceId, setSelectedServiceId] = useState('web-dev');

  const selectedServiceCategory = SERVICE_PRICING_CATEGORIES.find((s) => s.id === selectedServiceId) || SERVICE_PRICING_CATEGORIES[0];
  const activeMatrix = SERVICE_FEATURE_MATRICES[selectedServiceId] || SERVICE_FEATURE_MATRICES['web-dev'];

  return (
    <div className="w-full bg-white dark:bg-dark-bg text-gray-900 dark:text-white font-sans">
      <SEO
        title="Transparent Pricing Packages for All Services"
        description="Explore transparent pricing packages across Web Development, UI/UX Design Systems, AI Automation, and Mobile Apps."
      />

      {/* Header Section */}
      <section className="py-20 bg-white dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Centered Section Header */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-6xl font-heading font-black tracking-tight mb-4 text-gray-900 dark:text-white"
          >
            Transparent Multi-Service <span className="text-brand-600 dark:text-brand-500">Pricing Packages</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto font-normal mb-10"
          >
            Transparent milestone pricing tailored for all GM Digital Studio services: Web Development, UI/UX Design Systems, AI Automation & Mobile Apps.
          </motion.p>

          {/* Service Category Selection Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
            {SERVICE_PRICING_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedServiceId(cat.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
                  selectedServiceId === cat.id
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25 scale-105'
                    : 'bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                {categoryIcons[cat.id]}
                <span>{cat.title}</span>
              </button>
            ))}
          </div>

          {/* Monthly / Annual Billing Toggle */}
          <div className="inline-flex items-center gap-3 p-1.5 rounded-2xl bg-gray-100 dark:bg-dark-surface border border-gray-200 dark:border-dark-border">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-dark-bg text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Monthly Milestone
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                billingCycle === 'annual'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <span>Annual Retainer</span>
              <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-extrabold uppercase">
                Save 20%
              </span>
            </button>
          </div>

        </div>
      </section>

      {/* Selected Service Specific Plans Grid */}
      <section className="py-20 bg-gray-50/70 dark:bg-dark-surface/30 border-b border-gray-100 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 block mb-2">
              Selected Service Category
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 dark:text-white">
              {selectedServiceCategory.title} Packages
            </h2>
          </div>

          <div className={`grid grid-cols-1 ${selectedServiceCategory.plans.length === 1 ? 'max-w-xl mx-auto' : 'md:grid-cols-2 max-w-5xl mx-auto'} gap-8 items-stretch`}>
            {selectedServiceCategory.plans.map((plan, index) => {
              const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className={`rounded-3xl p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 ${
                    plan.popular
                      ? 'bg-slate-950 text-white border-2 border-brand-500 shadow-2xl shadow-brand-500/10 relative z-10'
                      : 'bg-white dark:bg-dark-surface border border-gray-200/80 dark:border-dark-border text-gray-900 dark:text-white shadow-sm hover:shadow-xl'
                  }`}
                >
                  <div>
                    {plan.popular && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/40 text-brand-400 text-xs font-bold uppercase tracking-wider mb-6">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Recommended Package</span>
                      </div>
                    )}

                    <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {plan.name}
                    </h3>

                    <p className={`text-xs leading-relaxed mb-6 ${plan.popular ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'}`}>
                      {plan.description}
                    </p>

                    <div className="flex items-baseline gap-1 mb-8">
                      <span className="text-4xl sm:text-5xl font-black tracking-tight">
                        ${price.toLocaleString()}
                      </span>
                      <span className={`text-xs font-medium ${plan.popular ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        / month
                      </span>
                    </div>

                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 ${plan.popular ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      Deliverables Included:
                    </h4>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start text-xs font-medium">
                          <Check className={`w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-brand-500' : 'text-brand-600 dark:text-brand-500'}`} />
                          <span className={plan.popular ? 'text-gray-200' : 'text-gray-700 dark:text-gray-300'}>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to={plan.ctaLink}
                    className={`w-full inline-flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm transition-all duration-200 shadow-md ${
                      plan.popular
                        ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/30'
                        : 'bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-gray-950 text-white'
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DYNAMIC Service Feature Matrix Comparison Table */}
      <section className="py-20 bg-white dark:bg-dark-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 block mb-2">
              Dynamic Comparison Matrix
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black tracking-tight mb-4 text-gray-900 dark:text-white">
              {activeMatrix.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Detailed technical deliverables matrix dynamically updated for <strong className="text-brand-600 dark:text-brand-400">{selectedServiceCategory.title}</strong>.
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedServiceId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="overflow-x-auto rounded-3xl border border-gray-200/80 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/40 shadow-sm"
            >
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-dark-border bg-gray-100/80 dark:bg-dark-surface">
                    <th className="p-4 sm:p-5 font-bold text-gray-900 dark:text-white">Specific Technical Deliverables</th>
                    <th className="p-4 sm:p-5 font-bold text-gray-900 dark:text-white text-center">Starter Tier</th>
                    <th className="p-4 sm:p-5 font-bold text-brand-600 dark:text-brand-400 text-center">Scale Tier</th>
                    <th className="p-4 sm:p-5 font-bold text-gray-900 dark:text-white text-center">Enterprise Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60 dark:divide-dark-border/60">
                  {activeMatrix.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-white dark:hover:bg-dark-bg/60 transition-colors">
                      <td className="p-4 sm:p-5 font-semibold text-gray-800 dark:text-gray-200">{row.name}</td>
                      <td className="p-4 sm:p-5 text-center text-gray-600 dark:text-gray-400">{row.starter}</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-gray-900 dark:text-white">{row.scale}</td>
                      <td className="p-4 sm:p-5 text-center text-gray-600 dark:text-gray-400">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      {/* Brand-Orange Floating Card CTA Banner */}
      <section className="py-20 bg-white dark:bg-dark-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-brand-600 text-white p-10 sm:p-14 text-center shadow-2xl overflow-hidden border border-brand-500">
            <h2 className="text-3xl sm:text-4xl font-heading font-black mb-4 text-white">
              Need a Custom Scope Estimate?
            </h2>
            <p className="text-orange-100 text-base mb-8 leading-relaxed max-w-xl mx-auto font-medium">
              Schedule a 30-minute consultation with our lead software architects to review your technical requirements.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white hover:bg-gray-100 text-gray-950 font-bold text-base shadow-xl transition-all hover:scale-105"
            >
              <span>Schedule a Scope Review</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Pricing;
