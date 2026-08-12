import React from 'react';
import { motion } from 'framer-motion';
import { FEATURED_PROJECTS } from '../../constants/homeData';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturedProjectsSection: React.FC = () => {
  return (
    <section className="py-24 bg-gray-50/80 dark:bg-dark-surface/40 border-y border-gray-200/80 dark:border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-heading font-black text-gray-900 dark:text-white tracking-tight mb-4">
            Featured Projects
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-base">
            Explore how our team engineered high-performing web platforms, SaaS tools, and digital solutions for leading organizations.
          </p>
        </div>

        {/* Projects Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {FEATURED_PROJECTS.map((project, index) => {
            const projectUrl = `/portfolio/${project.id}`;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group rounded-2xl bg-white dark:bg-dark-bg border border-gray-200/80 dark:border-dark-border overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                <Link to={projectUrl} className="relative aspect-[16/10] overflow-hidden bg-gray-900 block">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                </Link>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-600 transition-colors">
                      <Link to={projectUrl} className="hover:text-brand-600 transition-colors">
                        {project.title}
                      </Link>
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {project.category}
                    </span>
                    <Link
                      to={projectUrl}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 group-hover:bg-brand-600 text-brand-600 dark:text-brand-400 group-hover:text-white border border-brand-200/80 dark:border-brand-900/80 text-xs font-bold transition-all duration-300 shadow-sm"
                    >
                      <span>View Case Study</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
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

export default FeaturedProjectsSection;
