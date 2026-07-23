import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Layout, Cpu, Sparkles, Smartphone, Database, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    title: 'Modern Web Development',
    description: 'High-performance React and Next.js web applications engineered for Core Web Vitals, accessibility, and high search engine ranking.',
    icon: <Code2 className="w-7 h-7 text-brand-600 dark:text-brand-500" />,
    image: webDevImg,
    deliverables: [
      'React 18 & Next.js App Router Architecture',
      'Mobile-First Responsive Layouts',
      'Core Web Vitals & Speed Optimization',
      'SEO Metadata & Semantic Structure',
      'Headless CMS & API Integration',
    ],
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX & Product Design',
    description: 'Intuitive user interface design and comprehensive Figma design systems structured to boost user engagement and conversion.',
    icon: <Layout className="w-7 h-7 text-brand-600 dark:text-brand-500" />,
    image: uiUxImg,
    deliverables: [
      'Full Figma Tokenized Design Systems',
      'High-Fidelity Interactive Wireframes',
      'User Journey & Experience Audits',
      'Micro-Animations & Interaction Specs',
      'Clickable Mobile & Desktop Prototypes',
    ],
  },
  {
    id: 'ai-automation',
    title: 'Workflow & AI Automation',
    description: 'Smart API integrations and automated data pipelines designed to streamline operations, reduce manual overhead, and optimize workflows.',
    icon: <Cpu className="w-7 h-7 text-brand-600 dark:text-brand-500" />,
    image: aiAutomationImg,
    deliverables: [
      'Custom API Integrations & Webhooks',
      'Automated Data Sync Pipelines',
      'Transactional Email & Notification Triggers',
      'Process Bottleneck Elimination',
      'Third-Party SaaS Orchestration',
    ],
  },
  {
    id: 'brand-strategy',
    title: 'Brand Strategy & Identity',
    description: 'Memorable brand positioning, visual style guides, custom typography, and complete visual identity systems for growing companies.',
    icon: <Sparkles className="w-7 h-7 text-brand-600 dark:text-brand-500" />,
    image: brandIdentityImg,
    deliverables: [
      'Brand Identity Guidelines & Style Books',
      'Typography & Color Palette Tokens',
      'Vector Logo & Asset Package Export',
      'Social & Marketing Media Kits',
      'Brand Positioning Statements',
    ],
  },
  {
    id: 'mobile-applications',
    title: 'Cross-Platform Mobile Apps',
    description: 'Native-performing iOS and Android applications built with React Native for smooth performance and offline synchronization.',
    icon: <Smartphone className="w-7 h-7 text-brand-600 dark:text-brand-500" />,
    image: mobileAppsImg,
    deliverables: [
      'Cross-Platform iOS & Android Codebase',
      'Offline Data Cache & Synchronization',
      'Native Device Feature Integration',
      'Push Notification Infrastructure',
      'App Store & Play Store Deployment',
    ],
  },
  {
    id: 'cloud-infrastructure',
    title: 'Cloud & Database Architecture',
    description: 'Resilient backend infrastructure using Supabase, PostgreSQL, row-level security, and serverless cloud deployment.',
    icon: <Database className="w-7 h-7 text-brand-600 dark:text-brand-500" />,
    image: cloudInfrastructureImg,
    deliverables: [
      'PostgreSQL Relational Database Schema',
      'Row Level Security (RLS) Policies',
      'Supabase Authentication & Role Access',
      'Serverless Cloud Edge Deployments',
      'Automated Database Backup Policies',
    ],
  },
];

const Services: React.FC = () => {
  return (
    <div className="w-full bg-white dark:bg-dark-bg text-gray-900 dark:text-white">
      
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
            <span className="text-brand-500">Designed For Growth</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto font-normal"
          >
            We deliver end-to-end frontend development, UI/UX design systems, cloud backend architecture, and workflow automation.
          </motion.p>
        </div>
      </section>

      {/* Services List */}
      <section className="py-24 bg-white dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          {DETAILED_SERVICES.map((service, index) => {
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-8 sm:p-12 rounded-3xl bg-gray-50/70 dark:bg-dark-surface/40 border border-gray-200/80 dark:border-dark-border ${
                  isEven ? '' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Text Content */}
                <div className={isEven ? 'order-1' : 'order-1 lg:order-2'}>
                  <div className="p-3 rounded-2xl bg-white dark:bg-dark-bg border border-gray-200/80 dark:border-dark-border w-fit mb-5 shadow-sm">
                    {service.icon}
                  </div>

                  <h2 className="text-3xl font-heading font-black text-gray-900 dark:text-white mb-4">
                    {service.title}
                  </h2>

                  <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    {service.description}
                  </p>

                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Key Deliverables:</h4>
                  <ul className="space-y-2.5">
                    {service.deliverables.map((item, dIdx) => (
                      <li key={dIdx} className="flex items-start text-xs font-medium text-gray-700 dark:text-gray-300">
                        <Check className="w-4 h-4 text-brand-600 dark:text-brand-500 mr-2.5 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Image Showcase */}
                <div className={`relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg bg-gray-900 ${
                  isEven ? 'order-2' : 'order-2 lg:order-1'
                }`}>
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            );
          })}
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
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-slate-950 hover:bg-black text-white font-bold text-base shadow-xl border border-white/20 transition-all hover:scale-105"
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
