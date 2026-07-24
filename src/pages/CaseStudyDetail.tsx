import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ArrowLeft, Quote } from 'lucide-react';
import SEO from '../components/common/SEO';
import { CASE_STUDIES } from '../constants/portfolioData';

const CaseStudyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const caseStudy = CASE_STUDIES.find((c) => c.slug === id || c.id === id) || CASE_STUDIES[0];

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

          <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight mb-6 leading-tight">
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
              src={caseStudy.heroImageUrl}
              alt={caseStudy.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Challenge & Solution Grid */}
      <section className="py-16 bg-white dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="p-8 rounded-3xl bg-gray-50/80 dark:bg-dark-surface border border-gray-200/80 dark:border-dark-border">
              <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                The Challenge
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {caseStudy.challenge}
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gray-50/80 dark:bg-dark-surface border border-gray-200/80 dark:border-dark-border">
              <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                Our Engineering Solution
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {caseStudy.solution}
              </p>
            </div>
          </div>

          {/* Key Deliverables & Tech Stack */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-6">
                Key Deliverables
              </h3>
              <ul className="space-y-3">
                {caseStudy.deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-start text-xs font-medium text-gray-700 dark:text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-500 mr-2.5 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-6">
                Technology Stack Used
              </h3>
              <div className="flex flex-wrap gap-2">
                {caseStudy.techStack.map((tech, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-dark-surface border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Results Summary Cards */}
          <div>
            <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-6">
              Quantifiable Impact & Results
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {caseStudy.results.map((res, rIdx) => (
                <div key={rIdx} className="p-6 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/80 dark:border-brand-900/50">
                  <span className="block text-2xl font-black text-brand-600 dark:text-brand-500 mb-2">
                    0{rIdx + 1}
                  </span>
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                    {res}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Client Testimonial Quote */}
          {caseStudy.testimonial && (
            <div className="p-8 sm:p-12 rounded-3xl bg-slate-950 text-white border border-brand-500/40 relative overflow-hidden">
              <Quote className="w-12 h-12 text-brand-500/20 absolute top-6 left-6 pointer-events-none" />
              <p className="text-base sm:text-lg italic font-medium leading-relaxed mb-6 relative z-10 text-gray-200">
                "{caseStudy.testimonial.quote}"
              </p>
              <div className="flex items-center gap-4 relative z-10">
                <img
                  src={caseStudy.testimonial.avatarUrl}
                  alt={caseStudy.testimonial.author}
                  className="w-12 h-12 rounded-full object-cover border border-brand-500/50"
                />
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
