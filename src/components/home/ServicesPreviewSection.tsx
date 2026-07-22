import React from 'react';
import { motion } from 'framer-motion';
import { FEATURED_SERVICES } from '../../constants/homeData';
import { Code2, Layout, Cpu, Sparkles, Smartphone, Database, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const iconMap: Record<string, React.ReactNode> = {
  Code2: <Code2 className="w-6 h-6 text-brand-600 dark:text-brand-500" />,
  Layout: <Layout className="w-6 h-6 text-brand-600 dark:text-brand-500" />,
  Cpu: <Cpu className="w-6 h-6 text-brand-600 dark:text-brand-500" />,
  Sparkles: <Sparkles className="w-6 h-6 text-brand-600 dark:text-brand-500" />,
  Smartphone: <Smartphone className="w-6 h-6 text-brand-600 dark:text-brand-500" />,
  Database: <Database className="w-6 h-6 text-brand-400" />,
};

const serviceImages: Record<string, string> = {
  'web-dev': 'https://images.pexels.com/photos/326514/pexels-photo-326514.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=300&w=500',
  'ui-ux': 'https://images.pexels.com/photos/39559/ipad-mockup-apple-business-39559.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=300&w=500',
  'ai-automation': 'https://images.pexels.com/photos/461073/pexels-photo-461073.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=300&w=500',
  'brand-identity': 'https://images.pexels.com/photos/7667442/pexels-photo-7667442.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=300&w=500',
  'mobile-dev': 'https://images.pexels.com/photos/4158/apple-iphone-smartphone-desk.jpg?auto=compress&cs=tinysrgb&fit=crop&h=300&w=500',
  'cloud-devops': 'https://images.pexels.com/photos/226172/pexels-photo-226172.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=300&w=500',
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
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Clean Glass Icon Badge */}
                  <div className={`absolute top-4 left-4 p-2.5 rounded-xl shadow-md backdrop-blur-md border ${
                    isLast 
                      ? 'bg-slate-900/90 border-brand-500/50 text-brand-400' 
                      : 'bg-white/90 dark:bg-slate-900/90 border-gray-200/80 dark:border-slate-800'
                  }`}>
                    {isLast ? <Database className="w-5 h-5 text-brand-400" /> : (iconMap[service.iconName] || <Code2 className="w-5 h-5 text-brand-500" />)}
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

                  <Link
                    to="/services"
                    className={`inline-flex items-center text-sm font-bold group-hover:translate-x-1 transition-transform ${
                      isLast ? 'text-brand-400 hover:text-brand-300' : 'text-brand-600 dark:text-brand-400'
                    }`}
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
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
