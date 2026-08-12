import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cmsService, type TestimonialItem } from '../../services/cmsService';
import { TESTIMONIALS as SEED_TESTIMONIALS } from '../../constants/homeData';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(SEED_TESTIMONIALS);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    cmsService.getTestimonials().then((data) => {
      if (data && data.length > 0) {
        setTestimonials(data);
      }
    });
  }, []);

  // Auto-advance carousel every 4 seconds across all testimonials
  useEffect(() => {
    if (testimonials.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const activeTestimonial = testimonials[currentIndex] || testimonials[0];

  return (
    <section className="py-24 relative overflow-hidden bg-white dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <h2 className="text-3xl sm:text-5xl font-heading font-black text-gray-900 dark:text-white tracking-tight mb-4">
          Client Testimonials
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-base mb-12">
          Read how our engineering quality and speed helped founders and tech leaders scale their digital products.
        </p>

        {/* Carousel Container */}
        <div className="relative bg-gray-50 dark:bg-dark-surface border border-gray-200/80 dark:border-dark-border rounded-3xl p-8 sm:p-12 shadow-lg">
          <Quote className="absolute top-6 right-8 w-12 h-12 text-brand-600/10 pointer-events-none" />

          {/* Slide Motion Wrapper */}
          <div className="min-h-[220px] flex flex-col justify-between items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial.id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4 }}
                className="w-full flex flex-col items-center"
              >
                {/* Rating stars */}
                <div className="flex items-center justify-center space-x-1 mb-6">
                  {Array.from({ length: activeTestimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote Content */}
                <p className="text-lg sm:text-xl text-gray-800 dark:text-gray-200 leading-relaxed mb-8 italic max-w-2xl font-normal">
                  "{activeTestimonial.content}"
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={activeTestimonial.avatarUrl}
                    alt={activeTestimonial.name}
                    loading="lazy"
                    decoding="async"
                    className="w-12 h-12 rounded-full object-cover border-2 border-brand-600 shadow-md"
                  />
                  <div className="text-left">
                    <h4 className="text-base font-bold text-gray-900 dark:text-white">
                      {activeTestimonial.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activeTestimonial.role} · <span className="text-brand-600 dark:text-brand-400 font-bold">{activeTestimonial.company}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel Arrows & Indicator Dots */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200/60 dark:border-gray-800">
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 transition-colors shadow-sm"
              aria-label="Previous Testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Slide Indicators */}
            <div className="flex items-center space-x-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'w-8 bg-brand-600'
                      : 'w-2.5 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="p-2.5 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 transition-colors shadow-sm"
              aria-label="Next Testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;
