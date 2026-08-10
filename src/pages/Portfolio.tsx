import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Filter, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { CASE_STUDIES } from '../constants/portfolioData';
import { cmsService } from '../services/cmsService';
import type { CaseStudy } from '../types/portfolio';

import heroBgVideo from '../assets/videos/hero-bg.mp4';

const CATEGORIES = ['All', 'Web Development', 'UI/UX Design', 'AI Automation', 'Mobile Apps'];

const Portfolio: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [studies, setStudies] = useState<CaseStudy[]>(CASE_STUDIES);

  useEffect(() => {
    const fetchLiveStudies = async () => {
      const liveStudies = await cmsService.getCaseStudies();
      if (liveStudies.length > 0) {
        setStudies(liveStudies);
      }
    };
    fetchLiveStudies();

    window.addEventListener('studio_cms_updated', fetchLiveStudies);
    return () => window.removeEventListener('studio_cms_updated', fetchLiveStudies);
  }, []);

  const filteredProjects = selectedCategory === 'All'
    ? studies
    : studies.filter((p) => p.category === selectedCategory);

  return (
    <div className="w-full bg-white dark:bg-dark-bg text-gray-900 dark:text-white font-sans">
      <SEO
        title="Portfolio & Client Case Studies"
        description="Explore our portfolio of high-performing React & Next.js web applications, tokenized Figma design systems, and custom SaaS software."
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
            <source src={heroBgVideo} type="video/mp4" />
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
            Engineering Portfolio & <br />
            <span className="text-brand-500">Digital Case Studies</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto font-normal"
          >
            Explore how we partner with ambitious startups and global brands to build scalable web applications, tokenized design systems, and cloud infrastructure.
          </motion.p>
        </div>
      </section>

      {/* Modern Asymmetric Bento Grid Section */}
      <section className="py-20 bg-white dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Centered Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-16">
            <span className="text-xs font-bold text-gray-400 mr-2 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                    : 'bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Asymmetric Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
            {filteredProjects.map((project, index) => {
              // Asymmetric grid column spans: first item is featured wide (8 cols), second is 4 cols, third is 4 cols, fourth is 8 cols
              const colSpanClass = index % 4 === 0 
                ? 'lg:col-span-8' 
                : index % 4 === 3 
                ? 'lg:col-span-8' 
                : 'lg:col-span-4';

              const isWide = index % 4 === 0 || index % 4 === 3;

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                  className={`${colSpanClass} group relative rounded-3xl bg-white dark:bg-dark-surface border border-gray-200/80 dark:border-dark-border overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between`}
                >
                  {/* Whole Card Link Wrapper */}
                  <Link to={`/portfolio/${project.slug}`} className="block w-full h-full">
                    
                    {/* Media Header Container */}
                    <div className={`relative ${isWide ? 'aspect-[16/9] md:aspect-[21/9]' : 'aspect-[4/3]'} overflow-hidden bg-gray-900`}>
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      
                      {/* Glass Category Tag */}
                      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-gray-950/80 text-white text-xs font-bold backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-brand-400" />
                        <span>{project.category}</span>
                      </div>

                      {/* Hover Overlay Button */}
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-2xl transition-transform transform group-hover:scale-105">
                          <span>Explore Case Study</span>
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>

                    {/* Card Content Box */}
                    <div className="p-8 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                          <span className="font-semibold text-brand-600 dark:text-brand-400">{project.client}</span>
                          <span>{project.year}</span>
                        </div>

                        <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-3 group-hover:text-brand-600 transition-colors leading-tight">
                          {project.title}
                        </h3>

                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                          {project.description}
                        </p>
                      </div>

                      {/* Metrics Highlights Row */}
                      <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-gray-800/80">
                        {project.metrics.map((m, mIdx) => (
                          <div key={mIdx} className="text-center">
                            <span className="block text-base sm:text-lg font-black text-brand-600 dark:text-brand-500">
                              {m.value}
                            </span>
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block truncate">
                              {m.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="px-8 pb-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-800/60 pt-4">
                      <span className="text-xs font-bold text-gray-400">Timeline: {project.timeline}</span>
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white dark:bg-brand-950/40 dark:text-brand-400 dark:hover:bg-brand-600 dark:hover:text-white text-xs font-bold transition-all duration-300 shadow-sm">
                        <span>View Case Study</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                  </Link>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Brand-Orange Floating Card CTA Banner */}
      <section className="py-20 bg-white dark:bg-dark-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-brand-600 text-white p-10 sm:p-14 text-center shadow-2xl overflow-hidden border border-brand-500">
            <h2 className="text-3xl sm:text-4xl font-heading font-black mb-4 text-white">
              Have a Product Idea in Mind?
            </h2>
            <p className="text-orange-100 text-base mb-8 leading-relaxed max-w-xl mx-auto font-medium">
              Let's build a high-converting web platform or custom SaaS application for your brand.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white hover:bg-gray-100 text-gray-950 font-bold text-base shadow-xl transition-all hover:scale-105"
            >
              <span>Start Your Project</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Portfolio;
