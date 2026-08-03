import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { BLOG_POSTS } from '../constants/portfolioData';
import { cmsService } from '../services/cmsService';
import type { BlogPost } from '../types/portfolio';

const Blog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS);

  const blogCategories = Array.from(new Set(['All', ...posts.map((p) => p.category)])).filter(Boolean);

  useEffect(() => {
    const fetchLivePosts = async () => {
      const livePosts = await cmsService.getBlogs();
      if (livePosts.length > 0) {
        setPosts(livePosts);
      }
    };
    fetchLivePosts();

    window.addEventListener('gm_cms_updated', fetchLivePosts);
    return () => window.removeEventListener('gm_cms_updated', fetchLivePosts);
  }, []);

  const filteredPosts = selectedCategory === 'All'
    ? posts
    : posts.filter((p) => p.category === selectedCategory);

  const featuredPost = posts[0] || BLOG_POSTS[0];
  const bottomPosts = filteredPosts.filter((post) => post.slug !== featuredPost.slug);

  return (
    <div className="w-full bg-white dark:bg-dark-bg text-gray-900 dark:text-white font-sans">
      <SEO
        title="Engineering Blog & Insights"
        description="Read the latest articles on React 18, Next.js architecture, Figma tokenized design systems, and AI automation."
      />

      {/* Header Section */}
      <section className="py-20 bg-white dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-6xl font-heading font-black tracking-tight mb-4 text-gray-900 dark:text-white"
          >
            Insights & <span className="text-brand-600 dark:text-brand-500">Engineering Blog</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto font-normal mb-10"
          >
            In-depth guides on React architecture, Figma design systems, Supabase backend orchestration, and AI process automation.
          </motion.p>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {blogCategories.map((cat) => (
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

        </div>
      </section>

      {/* Featured Article Banner */}
      <section className="py-16 bg-gray-50/70 dark:bg-dark-surface/30 border-b border-gray-100 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white dark:bg-dark-surface border border-gray-200/80 dark:border-dark-border overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-2 items-center group">
            
            <div className="relative aspect-[16/10] lg:aspect-auto h-full overflow-hidden bg-gray-900">
              <Link to={`/blog/${featuredPost.slug}`}>
                <img
                  src={featuredPost.imageUrl}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
              <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-brand-600 text-white text-xs font-bold shadow-md">
                Featured Insight
              </div>
            </div>

            <div className="p-8 sm:p-12 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <span className="font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">{featuredPost.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{featuredPost.readTime}</span>
                  </span>
                </div>

                <Link to={`/blog/${featuredPost.slug}`}>
                  <h2 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-white mb-4 leading-tight group-hover:text-brand-600 transition-colors">
                    {featuredPost.title}
                  </h2>
                </Link>

                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  {featuredPost.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <img
                    src={featuredPost.author.avatarUrl}
                    alt={featuredPost.author.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">{featuredPost.author.name}</h4>
                    <span className="text-[10px] text-gray-500">{featuredPost.author.role}</span>
                  </div>
                </div>

                <Link
                  to={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-gray-950 text-white text-xs font-bold transition-all shadow-sm"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Modern Article Grid without harsh bottom borders */}
      <section className="py-20 bg-white dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {bottomPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className="rounded-3xl bg-white dark:bg-dark-surface border border-gray-200/80 dark:border-dark-border overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
              >
                <Link to={`/blog/${post.slug}`} className="block h-full flex flex-col justify-between p-6">
                  <div>
                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-900 mb-6">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-gray-950/80 text-white text-[10px] font-bold backdrop-blur-md border border-white/10 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-brand-400" />
                        <span>{post.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 mb-3">
                      <span>{post.publishedAt}</span>
                      <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{post.readTime}</span>
                      </span>
                    </div>

                    <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-3 group-hover:text-brand-600 transition-colors leading-snug">
                      {post.title}
                    </h3>

                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                      {post.description}
                    </p>
                  </div>

                  {/* Modern Integrated Footer (No Harsh Border Lines!) */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={post.author.avatarUrl}
                        alt={post.author.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-800"
                      />
                      <div>
                        <span className="block text-xs font-bold text-gray-900 dark:text-white">{post.author.name}</span>
                        <span className="block text-[10px] text-gray-400">{post.author.role}</span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 text-xs font-bold group-hover:bg-brand-600 group-hover:text-white transition-all">
                      <span>Read</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
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
              Stay Ahead with Modern Digital Engineering
            </h2>
            <p className="text-orange-100 text-base mb-8 leading-relaxed max-w-xl mx-auto font-medium">
              Connect with our team to discuss how modern software architecture can transform your platform.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white hover:bg-gray-100 text-gray-950 font-bold text-base shadow-xl transition-all hover:scale-105"
            >
              <span>Get in Touch</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Blog;
