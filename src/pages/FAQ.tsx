import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, HelpCircle, ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { FAQ_ITEMS } from '../constants/portfolioData';
import faqGif from '../assets/animation/faq.gif';

const FAQ_CATEGORIES = ['All', 'General', 'Engineering & Stack', 'UI/UX & Design Systems', 'Pricing & Contracts', 'Security & SLA'];

const FAQ: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0].id);

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="w-full bg-white dark:bg-dark-bg text-gray-900 dark:text-white font-sans">
      <SEO
        title="Frequently Asked Questions (FAQ)"
        description="Find answers to common questions about GM Digital Studio's web development, UI/UX design, engineering stack, process, and billing terms."
      />

      {/* Centered Header Section */}
      <section className="py-20 bg-white dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-6xl font-heading font-black tracking-tight mb-4 text-gray-900 dark:text-white"
          >
            Frequently Asked <span className="text-brand-600 dark:text-brand-500">Questions</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto font-normal mb-8"
          >
            Everything you need to know about our digital engineering process, technical deliverables, security policies, and pricing models.
          </motion.p>

          {/* Search Input Box */}
          <div className="relative max-w-xl mx-auto mb-8">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (e.g. tech stack, design system, pricing)..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white text-sm focus:outline-none focus:border-brand-500 shadow-sm transition-colors"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                    : 'bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Main Split Grid: Animated FAQ Visual + Clean Accordions */}
      <section className="py-20 bg-gray-50/70 dark:bg-dark-surface/30 border-b border-gray-100 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Clean GIF Animation & Clickable Contact Card */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
              <div className="rounded-3xl bg-white dark:bg-dark-surface border border-gray-200/80 dark:border-dark-border p-6 shadow-xl overflow-hidden">
                
                {/* Clean GIF Showcase Card without Text Overlay */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-900 border border-gray-200/50 dark:border-gray-800 shadow-md mb-6">
                  <img
                    src={faqGif}
                    alt="FAQ Overview"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Clickable Direct Response Contact Card */}
                <Link
                  to="/contact"
                  className="group p-5 rounded-2xl bg-gray-50 dark:bg-dark-bg hover:bg-brand-50/60 dark:hover:bg-brand-950/20 border border-gray-200 dark:border-gray-800 hover:border-brand-500/50 flex items-center justify-between transition-all duration-300 shadow-sm"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-xl bg-brand-600 text-white shadow-md group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors">
                        Need a Direct Response?
                      </h5>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Our solutions team responds to inquiries within 24 hours.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
                </Link>

              </div>
            </div>

            {/* Right Column: Clean Accordion List */}
            <div className="lg:col-span-7">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-16 p-8 rounded-3xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border">
                  <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No matching questions found</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Try searching with a different keyword or category.</p>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all"
                  >
                    Reset Search Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFaqs.map((faq, index) => {
                    const isOpen = openId === faq.id;

                    return (
                      <motion.div
                        key={faq.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04, duration: 0.3 }}
                        className={`rounded-2xl bg-white dark:bg-dark-surface border overflow-hidden transition-all duration-300 ${
                          isOpen
                            ? 'border-brand-500/50 shadow-md'
                            : 'border-gray-200/80 dark:border-dark-border shadow-sm hover:border-gray-300'
                        }`}
                      >
                        <button
                          onClick={() => toggleItem(faq.id)}
                          className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-base text-gray-900 dark:text-white hover:text-brand-600 transition-colors"
                        >
                          <span className="text-sm sm:text-base leading-snug flex-1">{faq.question}</span>
                          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-brand-600' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-6 pt-2 text-xs sm:text-sm leading-relaxed text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-800/60">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* Brand-Orange Floating Card CTA Banner */}
      <section className="py-20 bg-white dark:bg-dark-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-brand-600 text-white p-10 sm:p-14 text-center shadow-2xl overflow-hidden border border-brand-500">
            <h2 className="text-3xl sm:text-4xl font-heading font-black mb-4 text-white">
              Still Have Questions?
            </h2>
            <p className="text-orange-100 text-base mb-8 leading-relaxed max-w-xl mx-auto font-medium">
              Our engineering team is ready to assist you. Contact us today to receive detailed project answers.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white hover:bg-gray-100 text-gray-950 font-bold text-base shadow-xl transition-all hover:scale-105"
            >
              <span>Contact Solution Engineers</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default FAQ;
