import React from 'react';
import { motion } from 'framer-motion';
import { FEATURED_SERVICES } from '../../constants/homeData';
import { Code2, Layout, Cpu, Sparkles, Smartphone, Database, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

import webDevImg from '../../assets/images/web-dev.jpg';
import uiUxImg from '../../assets/images/ui-ux.jpg';
import aiAutomationImg from '../../assets/images/ai-automation.jpg';
import brandIdentityImg from '../../assets/images/brand-identity.jpg';
import mobileAppsImg from '../../assets/images/mobile-apps.jpg';
import cloudInfrastructureImg from '../../assets/images/cloud-infrastructure.jpg';

const iconMap: Record<string, React.ReactNode> = {
  Code2: <Code2 className="w-6 h-6 text-brand-600 dark:text-brand-500" />,
  Layout: <Layout className="w-6 h-6 text-brand-600 dark:text-brand-500" />,
  Cpu: <Cpu className="w-6 h-6 text-brand-600 dark:text-brand-500" />,
  Sparkles: <Sparkles className="w-6 h-6 text-brand-600 dark:text-brand-500" />,
  Smartphone: <Smartphone className="w-6 h-6 text-brand-600 dark:text-brand-500" />,
  Database: <Database className="w-6 h-6 text-brand-400" />,
};

const serviceImages: Record<string, string> = {
  'web-dev': webDevImg,
  'ui-ux': uiUxImg,
  'ai-automation': aiAutomationImg,
  'brand-identity': brandIdentityImg,
  'mobile-dev': mobileAppsImg,
  'cloud-devops': cloudInfrastructureImg,
};

const ServicesPreviewSection: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-white dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-heading font-black text-gray-900 dark:text-white tracking-tight mb-4">
            Our Core Services
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
            From intuitive user interfaces to resilient backend architecture, we craft digital products engineered for long-term growth.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURED_SERVICES.map((service, index) => {
            const isLast = index === FEATURED_SERVICES.length - 1;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className={`group relative rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-2xl ${
                  isLast
                    ? 'bg-slate-950 text-white border-2 border-brand-500/80 shadow-xl shadow-brand-500/10'
                    : 'bg-white dark:bg-dark-surface border border-gray-200/80 dark:border-dark-border hover:border-brand-500'
                }`}
              >
                {/* Crisp Image Container without dark bottom gradient bleed */}
                <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-gray-900">
                  <img
                    src={serviceImages[service.id] || serviceImages['web-dev']}
                    alt={service.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Clean Glass Icon Badge */}
                  <div className={`absolute top-4 left-4 p-2.5 rounded-xl shadow-md backdrop-blur-md border ${
                    isLast 
                      ? 'bg-slate-900/90 border-brand-500/50 text-brand-400' 
                      : 'bg-white/90 dark:bg-slate-900/90 border-gray-200/80 dark:border-slate-800'
                  }`}>
                    {isLast ? <Database className="w-5 h-5 text-brand-400" /> : ((service.iconName && iconMap[service.iconName]) || <Code2 className="w-5 h-5 text-brand-500" />)}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className={`text-xl font-bold mb-2.5 transition-colors ${
                      isLast ? 'text-white' : 'text-gray-900 dark:text-white group-hover:text-brand-600'
                    }`}>
                      {service.title}
                    </h3>
                    
                    <p className={`text-sm mb-6 leading-relaxed ${
                      isLast ? 'text-slate-300' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {service.description}
                    </p>

                    <ul className="space-y-2 mb-6">
                      {service.features.map((feat, fIdx) => (
                        <li key={fIdx} className={`flex items-center text-xs font-medium ${
                          isLast ? 'text-slate-200' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          <Check className={`w-3.5 h-3.5 mr-2 flex-shrink-0 ${
                            isLast ? 'text-brand-500' : 'text-brand-600 dark:text-brand-500'
                          }`} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-dark-border/80 flex items-center justify-between">
                    <span className={`text-xs font-bold ${isLast ? 'text-slate-400' : 'text-gray-400 dark:text-gray-500'}`}>
                      {service.title.split(' ')[0]} Service
                    </span>
                    <Link
                      to="/services"
                      className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm ${
                        isLast
                          ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/30'
                          : 'bg-brand-50 dark:bg-brand-950/60 group-hover:bg-brand-600 text-brand-600 dark:text-brand-400 group-hover:text-white border border-brand-200/80 dark:border-brand-900/80'
                      }`}
                    >
                      <span>Explore Service</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ServicesPreviewSection;
