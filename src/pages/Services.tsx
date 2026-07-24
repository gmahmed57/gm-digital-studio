import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Layout, Cpu, Sparkles, Smartphone, Database, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';

import servicesBgVideo from '../assets/videos/services-bg.mp4';
import webDevImg from '../assets/images/web-dev.jpg';
import uiUxImg from '../assets/images/ui-ux.jpg';
import aiAutomationImg from '../assets/images/ai-automation.jpg';
import brandIdentityImg from '../assets/images/brand-identity.jpg';
import mobileAppsImg from '../assets/images/mobile-apps.jpg';
import cloudInfrastructureImg from '../assets/images/cloud-infrastructure.jpg';

const DETAILED_SERVICES = [
  {
    id: 'web-development',
    title: 'Web & SaaS Development',
    category: 'Engineering',
    description: 'High-performance React & Next.js applications engineered for Core Web Vitals, speed, and conversion.',
    icon: <Code2 className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
    image: webDevImg,
    deliverables: [
      'React 18 & Next.js App Router',
      'Mobile-First Responsive Layouts',
      'Core Web Vitals & Speed Optimization',
      'SEO Metadata & OpenGraph Setup',
    ],
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX & Design Systems',
    category: 'Product Design',
    description: 'Intuitive user interface design and comprehensive tokenized Figma design systems for cross-platform engineering.',
    icon: <Layout className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
    image: uiUxImg,
    deliverables: [
      'Tokenized Figma Design Systems',
      'Interactive High-Fidelity Wireframes',
      'User Journey & Conversion Audits',
      'Clickable Mobile & Desktop Prototypes',
    ],
  },
  {
    id: 'ai-automation',
    title: 'Workflow & AI Automation',
    category: 'Automation',
    description: 'Smart API integrations and automated data pipelines designed to streamline operations and eliminate bottlenecks.',
    icon: <Cpu className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
    image: aiAutomationImg,
    deliverables: [
      'Custom API Integrations & Webhooks',
      'Automated Data Sync Pipelines',
      'Transactional Resend Email Triggers',
      'Third-Party SaaS Orchestration',
    ],
  },
  {
    id: 'brand-strategy',
    title: 'Brand Strategy & Identity',
    category: 'Branding',
    description: 'Memorable brand positioning, visual style guides, custom typography, and complete visual identity systems.',
    icon: <Sparkles className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
    image: brandIdentityImg,
    deliverables: [
      'Brand Identity & Style Guidelines',
      'Typography & Color Palette Tokens',
      'Vector Logo & Asset Export Package',
      'Social & Marketing Media Kits',
    ],
  },
  {
    id: 'mobile-applications',
    title: 'Cross-Platform Mobile Apps',
    category: 'Mobile Dev',
    description: 'Native-performing iOS and Android applications built with React Native for smooth 60fps performance.',
    icon: <Smartphone className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
    image: mobileAppsImg,
    deliverables: [
      'Cross-Platform iOS & Android App',
      'Offline Data Cache & Synchronization',
      'Push Notification Infrastructure',
      'App Store & Play Store Deployment',
    ],
  },
  {
    id: 'cloud-infrastructure',
    title: 'Cloud & Database Architecture',
    category: 'Cloud & Security',
    description: 'Resilient backend infrastructure using Supabase, PostgreSQL, row-level security, and edge deployments.',
    icon: <Database className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
    image: cloudInfrastructureImg,
    deliverables: [
      'PostgreSQL Database Architecture',
      'Row Level Security (RLS) Policies',
      'Supabase Authentication & Role Access',
      'Serverless Cloud Edge Deployments',
    ],
  },
];

const Services: React.FC = () => {
  return (
    <div className="w-full bg-white dark:bg-dark-bg text-gray-900 dark:text-white font-sans">
      <SEO
        title="Digital Engineering Services"
        description="Explore GM Digital Studio's core services: Web Development, UI/UX Design Systems, AI Automation, Brand Identity, Mobile Apps, and Cloud Architecture."
      />

      {/* Hero Header with Relevant Ambient Video Loop */}
      <section className="py-24 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-45 scale-105"
          >
            <source src={servicesBgVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/75 via-gray-950/65 to-gray-950 z-10" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-6xl font-heading font-black tracking-tight mb-6"
          >
            Digital Engineering Services <br />
            <span className="text-brand-500">Engineered For Scale</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto font-normal"
          >
            End-to-end frontend architecture, tokenized design systems, cloud databases, and intelligent workflow automation.
          </motion.p>
        </div>
      </section>

      {/* Ultra-Clean Balanced 3-Column Service Cards Grid */}
      <section className="py-20 bg-white dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Centered Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-heading font-black text-gray-900 dark:text-white tracking-tight mb-4">
              Our Core Engineering Offerings
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              Standardized deliverables crafted to launch, scale, and optimize your digital product platform.
            </p>
          </div>

          {/* Balanced 3-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {DETAILED_SERVICES.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className="group rounded-3xl bg-white dark:bg-dark-surface border border-gray-200/80 dark:border-dark-border overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* High-Resolution Showcase Image Header */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-900">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 p-3 rounded-2xl bg-white/90 dark:bg-dark-bg/90 border border-gray-200/50 dark:border-dark-border backdrop-blur-md shadow-md text-brand-600 dark:text-brand-400">
                      {service.icon}
                    </div>
                  </div>

                  {/* Card Content Padding */}
                  <div className="p-8">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-brand-600 dark:text-brand-400 block mb-2">
                      {service.category}
                    </span>

                    <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-3 group-hover:text-brand-600 transition-colors leading-tight">
                      {service.title}
                    </h3>

                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                      {service.description}
                    </p>

                    {/* Key Deliverables Box */}
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-gray-800/80 mb-6">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">
                        Key Deliverables:
                      </span>
                      <ul className="space-y-2">
                        {service.deliverables.map((item, dIdx) => (
                          <li key={dIdx} className="flex items-start text-xs font-medium text-gray-700 dark:text-gray-300">
                            <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Modern Action Link Button */}
                <div className="px-8 pb-8 pt-4 border-t border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">{service.category}</span>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-brand-600 dark:bg-dark-bg dark:hover:bg-brand-600 text-white text-xs font-bold shadow-md transition-all duration-300 group-hover:scale-105"
                  >
                    <span>Request Scope Estimate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Brand-Orange Floating Card CTA Banner */}
      <section className="py-20 bg-white dark:bg-dark-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-brand-600 text-white p-10 sm:p-14 text-center shadow-2xl overflow-hidden border border-brand-500">
            <h2 className="text-3xl sm:text-4xl font-heading font-black mb-4 text-white">
              Need a Custom Digital Solution?
            </h2>
            <p className="text-orange-100 text-base mb-8 leading-relaxed max-w-xl mx-auto font-medium">
              Get in touch with our solutions team to receive a tailored project estimate and technical roadmap.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white hover:bg-gray-100 text-gray-950 font-bold text-base shadow-xl transition-all hover:scale-105"
            >
              <span>Request a Consultation</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Services;
