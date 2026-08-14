import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../components/common/SEO';
import { CASE_STUDIES } from '../constants/portfolioData';
import { cmsService } from '../services/cmsService';
import type { CaseStudy } from '../types/portfolio';
import { resolveAssetUrl, handleImageError } from '../utils/imageUtils';

const CaseStudyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [caseStudy, setCaseStudy] = useState<CaseStudy>(
    CASE_STUDIES.find((c) => c.slug === id || c.id === id) || CASE_STUDIES[0]
  );

  useEffect(() => {
    const fetchLiveCaseStudy = async () => {
      if (!id) return;
      const liveStudy = await cmsService.getCaseStudyBySlug(id);
      if (liveStudy) {
        setCaseStudy(liveStudy);
      } else {
        const fallback = CASE_STUDIES.find((c) => c.slug === id || c.id === id) || CASE_STUDIES[0];
        setCaseStudy(fallback);
      }
    };
    fetchLiveCaseStudy();
  }, [id]);

  return (
    <div className="w-full bg-white dark:bg-dark-bg text-gray-900 dark:text-white">
      <SEO
        title={`${caseStudy.title} | Case Study`}
        description={caseStudy.description}
      />

      {/* Hero Section */}
      <section className="py-20 bg-gray-950 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portfolio</span>
          </Link>

          <span className="block text-xs font-bold uppercase tracking-widest text-brand-500 mb-3">
            {caseStudy.category} Case Study
          </span>

          <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight mb-6 leading-tight text-white">
            {caseStudy.title}
          </h1>

          <p className="text-base sm:text-xl text-gray-300 leading-relaxed mb-10 max-w-3xl">
            {caseStudy.summary}
          </p>

          {/* Project Details Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div>
              <span className="block text-xs text-gray-400 font-medium">Client</span>
              <span className="text-sm font-bold text-white">{caseStudy.client}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-400 font-medium">Year</span>
              <span className="text-sm font-bold text-white">{caseStudy.year}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-400 font-medium">Timeline</span>
              <span className="text-sm font-bold text-white">{caseStudy.timeline}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-400 font-medium">Category</span>
              <span className="text-sm font-bold text-brand-400">{caseStudy.category}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Showcase Image */}
      <section className="py-12 bg-white dark:bg-dark-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 bg-gray-900">
            <img
              src={resolveAssetUrl(caseStudy.heroImageUrl, 'project', caseStudy.title)}
              alt={caseStudy.title}
              onError={(e) => handleImageError(e, 'project', caseStudy.title)}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Challenge & Solution Grid */}
      <section className="py-20 bg-white dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">

          {/* Challenge & Solution — two-column with accent border */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Challenge */}
            <div className="relative p-8 rounded-3xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1 rounded-l-3xl bg-gray-900 dark:bg-gray-400" />
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
                <span className="w-4 h-px bg-gray-400" />
                The Challenge
              </span>
              <h3 className="text-lg font-heading font-black text-black dark:text-white mb-3 leading-snug">
                What needed solving
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {caseStudy.challenge}
              </p>
            </div>

            {/* Solution */}
            <div className="relative p-8 rounded-3xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1 rounded-l-3xl bg-brand-500" />
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">
                <span className="w-4 h-px bg-brand-400" />
                Our Solution
              </span>
              <h3 className="text-lg font-heading font-black text-black dark:text-white mb-3 leading-snug">
                How we engineered it
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {caseStudy.solution}
              </p>
            </div>
          </div>

          {/* Key Deliverables & Tech Stack */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Deliverables — step-numbered list */}
            <div>
              <span className="inline-block text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-1">Scope of Work</span>
              <h3 className="text-xl font-heading font-black text-black dark:text-white mb-6">
                Key Deliverables
              </h3>
              <ul className="space-y-3">
                {caseStudy.deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 group">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-black flex items-center justify-center mt-0.5 group-hover:bg-brand-500 group-hover:text-white transition-all">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed pt-0.5">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech Stack — styled pill tags */}
            <div>
              <span className="inline-block text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-1">Engineering Stack</span>
              <h3 className="text-xl font-heading font-black text-black dark:text-white mb-6">
                Technologies Used
              </h3>
              <div className="flex flex-wrap gap-2">
                {caseStudy.techStack.map((tech, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-xs font-bold px-3.5 py-2 rounded-xl bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border text-gray-800 dark:text-gray-200 shadow-xs hover:border-brand-400 hover:text-brand-600 transition-all cursor-default"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Results Summary Cards */}
          <div>
            <h3 className="text-xl font-heading font-black text-black dark:text-white mb-6">
              Quantifiable Impact &amp; Results
            </h3>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {caseStudy.results.map((res, rIdx) => {
                const colonIdx = res.indexOf(':');
                const hasColon = colonIdx !== -1;
                const statValue = hasColon ? res.slice(0, colonIdx).trim() : `0${rIdx + 1}`;
                const statLabel = hasColon ? res.slice(colonIdx + 1).trim() : res;

                return (
                  <motion.div 
                    key={rIdx} 
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                    }}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    className="p-6 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-xl hover:shadow-brand-500/5 transition-colors group cursor-default"
                  >
                    <span className="block text-3xl font-heading font-black text-brand-600 dark:text-brand-500 mb-3 group-hover:scale-105 origin-left transition-transform duration-300">
                      {statValue}
                    </span>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                      {statLabel}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Client Testimonial Quote */}
          {caseStudy.testimonial && (
            <div className="p-8 sm:p-12 rounded-3xl bg-slate-950 text-white border border-brand-500/40 relative overflow-hidden">
              <Quote className="w-12 h-12 text-brand-500/20 absolute top-6 left-6 pointer-events-none" />
              <p className="text-base sm:text-lg italic font-medium leading-relaxed mb-6 relative z-10 text-gray-200">
                "{caseStudy.testimonial.quote}"
              </p>
              <div className="flex items-center gap-4 relative z-10">
                {caseStudy.testimonial.avatarUrl ? (
                  <img
                    src={resolveAssetUrl(caseStudy.testimonial.avatarUrl, 'avatar')}
                    alt={caseStudy.testimonial.author}
                    onError={(e) => handleImageError(e, 'avatar')}
                    className="w-12 h-12 rounded-full object-cover border-2 border-brand-500/50 flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-black text-lg border border-brand-500/50 flex-shrink-0">
                    {caseStudy.testimonial.author?.charAt(0).toUpperCase() || 'C'}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-white">{caseStudy.testimonial.author}</h4>
                  <span className="text-xs text-gray-400">{caseStudy.testimonial.role}, {caseStudy.testimonial.company}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Brand-Orange Floating Card CTA Banner */}
      <section className="py-20 bg-white dark:bg-dark-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-brand-600 text-white p-10 sm:p-14 text-center shadow-2xl overflow-hidden border border-brand-500">
            <h2 className="text-3xl sm:text-4xl font-heading font-black mb-4 text-white">
              Ready to Achieve Similar Results?
            </h2>
            <p className="text-orange-100 text-base mb-8 leading-relaxed max-w-xl mx-auto font-medium">
              Schedule a strategy consultation with our software architects to review your product roadmap.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-slate-950 hover:bg-black text-white font-bold text-base shadow-xl border border-white/20 transition-all hover:scale-105"
            >
              <span>Schedule a Consultation</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default CaseStudyDetail;
