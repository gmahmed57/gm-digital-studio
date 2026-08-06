import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Calendar,
  ArrowRight,
  Tag,
  MessageSquare,
  List,
  Send,
  CheckCircle2,
} from 'lucide-react';
import SEO from '../components/common/SEO';
import { cmsService, type BlogComment } from '../services/cmsService';
import type { BlogPost } from '../types/portfolio';
import { BlogContentRenderer } from '../components/common/BlogContentRenderer';

// Author avatar — initials derived purely from DB name, no hardcoded strings
const AuthorAvatar: React.FC<{ src?: string; name?: string; className?: string }> = ({ src, name, className = 'w-12 h-12' }) => {
  const [imgError, setImgError] = useState(false);
  const initials = name
    ? name.trim().split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '';
  if (!src || imgError) {
    return (
      <div className={`${className} rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-lg border border-brand-500/50 flex-shrink-0`}>
        {initials}
      </div>
    );
  }
  return <img src={src} alt={name || ''} onError={() => setImgError(true)} className={`${className} rounded-full object-cover border border-brand-500/50 flex-shrink-0`} />;
};

// TOC Heading item with id & display text from the live DOM
interface TocHeading {
  id: string;
  text: string;
  level: number;
}

const BlogPostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentSubmitted, setCommentSubmitted] = useState(false);

  // DOM-based TOC state — populated after article renders into the DOM
  const [tocItems, setTocItems] = useState<TocHeading[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const articleRef = useRef<HTMLDivElement>(null);


  // Fetch live post + comments from Supabase — no static fallbacks
  useEffect(() => {
    const fetchLivePostAndComments = async () => {
      if (!id) return;
      setLoading(true);
      const livePost = await cmsService.getBlogBySlug(id);
      if (livePost) {
        setPost(livePost);
        const liveComments = await cmsService.getCommentsForBlog(livePost.id);
        setComments(liveComments);
      } else {
        setPost(null);
      }
      setLoading(false);
    };
    fetchLivePostAndComments();
  }, [id]);

  // ── DOM-based TOC extraction — runs AFTER article renders into DOM ──
  // Wait 3 render ticks to ensure BlogContentRenderer has mounted & injected IDs
  useEffect(() => {
    if (!post?.content) return;

    const extractTocFromDom = () => {
      if (!articleRef.current) return;
      const headingEls = articleRef.current.querySelectorAll<HTMLElement>('h2');
      const items: TocHeading[] = [];
      headingEls.forEach((el) => {
        const id = el.getAttribute('id');
        const text = el.textContent?.trim();
        const level = parseInt(el.tagName.replace('H', ''), 10);
        if (id && text) {
          items.push({ id, text, level });
        }
      });
      setTocItems(items);

      // Set first heading active
      if (items.length > 0) setActiveHeadingId(items[0].id);
    };

    // Small delay to ensure React has fully committed the DOM
    const timer = setTimeout(extractTocFromDom, 300);
    return () => clearTimeout(timer);
  }, [post?.content]);

  // ── Scroll-event scrollspy — reliably tracks active heading as user scrolls ──
  useEffect(() => {
    if (tocItems.length === 0) return;

    const OFFSET = 120; // px from top of viewport to consider a heading "active"

    const handleScroll = () => {
      const scrollY = window.scrollY + OFFSET;

      // Walk headings from bottom to top — first one whose top <= scrollY is active
      let activeId = tocItems[0].id;
      for (let i = 0; i < tocItems.length; i++) {
        const el = document.getElementById(tocItems[i].id);
        if (el && el.getBoundingClientRect().top + window.scrollY <= scrollY) {
          activeId = tocItems[i].id;
        }
      }
      setActiveHeadingId(activeId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // run once on mount to set initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, [tocItems]);

  // Smooth scroll to heading when TOC link clicked
  const scrollToHeading = (e: React.MouseEvent<HTMLAnchorElement>, headingId: string) => {
    e.preventDefault();
    const el = document.getElementById(headingId);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
      setActiveHeadingId(headingId);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !commentText.trim() || !post) return;
    const success = await cmsService.submitComment(
      post.id,
      authorName.trim(),
      authorEmail.trim(),
      commentText.trim()
    );
    if (success) {
      setCommentSubmitted(true);
      setCommentText('');
      setTimeout(() => setCommentSubmitted(false), 5000);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-white dark:bg-dark-bg">
        <div className="flex flex-col items-center gap-4 text-gray-400 dark:text-gray-500">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">Loading article…</span>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center gap-6 bg-white dark:bg-dark-bg">
        <p className="text-gray-500 dark:text-gray-400 text-lg font-semibold">Article not found.</p>
        <Link to="/blog" className="px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-dark-bg text-gray-900 dark:text-white font-sans">
      <SEO title={`${post.title} | Blog`} description={post.description} />

      {/* Header Section */}
      <section className="py-20 bg-gray-950 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Articles</span>
          </Link>

          <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
            <span className="font-bold text-brand-500 uppercase tracking-widest">{post.category}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{post.publishedAt}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readTime}</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight mb-6 leading-tight text-white drop-shadow-xs">
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-3xl mb-8">
            {post.description}
          </p>

          {/* Author Card */}
          <div className="flex items-center gap-3">
            <AuthorAvatar src={post.author?.avatarUrl} name={post.author?.name || ''} className="w-12 h-12" />
            <div>
              <h4 className="text-sm font-bold text-white">{post.author?.name}</h4>
              <span className="text-xs text-gray-400">{post.author?.role}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cover Image */}
      {post.imageUrl ? (
        <section className="py-12 bg-white dark:bg-dark-bg">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 bg-gray-900">
              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
            </div>
          </div>
        </section>
      ) : null}

      {/* Article Body + Table of Contents Sidebar */}
      <section className="py-12 bg-white dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Article Main Body */}
          <div className="lg:col-span-8 space-y-6">
            {/* ref is on a wrapper div so we can querySelectorAll inside it */}
            <div ref={articleRef}>
              <BlogContentRenderer content={post.content} />
            </div>

            {/* Tags Footer */}
            <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-wrap gap-2 items-center">
              <Tag className="w-4 h-4 text-gray-400 mr-2" />
              {post.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="text-xs font-semibold px-3 py-1 rounded-md bg-gray-100 dark:bg-dark-surface border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Comments Section */}
            <div className="pt-12 mt-12 border-t border-gray-200 dark:border-gray-800 space-y-8">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
                  Discussion &amp; Comments ({comments.length})
                </h3>
              </div>

              {/* Comment Form */}
              <form
                onSubmit={handleAddComment}
                className="p-6 rounded-3xl bg-gray-50 dark:bg-dark-surface border border-gray-200/80 dark:border-dark-border space-y-4"
              >
                {commentSubmitted && (
                  <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Your comment has been submitted! It will appear once approved by Studio Admin.</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Your Email (Optional)</label>
                    <input
                      type="email"
                      value={authorEmail}
                      onChange={(e) => setAuthorEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Your Comment *</label>
                  <textarea
                    required
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Join the discussion..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  <span>Submit Comment</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-5 rounded-2xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold text-xs">
                          {comment.name.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{comment.name}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(comment.created_at || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed pl-11">
                      {comment.content}
                    </p>

                    {comment.admin_reply && (
                      <div className="mt-3 ml-11 p-4 rounded-xl bg-gray-50 dark:bg-dark-bg/40 border-l-2 border-brand-500 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-[10px]">
                              GM
                            </div>
                            <span className="text-[11px] font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                              GM Digital Studio
                              <span className="px-1.5 py-0.5 rounded text-[8px] bg-brand-500/10 text-brand-600 dark:text-brand-400 font-extrabold uppercase tracking-wider">
                                Admin
                              </span>
                            </span>
                          </div>
                          {comment.admin_reply_at && (
                            <span className="text-[9px] text-gray-400 font-mono">
                              {new Date(comment.admin_reply_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed pl-8">
                          {comment.admin_reply}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Table of Contents Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 p-6 rounded-3xl bg-gray-50/80 dark:bg-dark-surface/50 border border-gray-200/80 dark:border-dark-border space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-200/80 dark:border-gray-800 pb-3">
                <List className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                  Table of Contents
                </h4>
              </div>

              {tocItems.length > 0 ? (
                <ul className="space-y-1 text-xs">
                  {tocItems.map((item) => {
                    const isActive = activeHeadingId === item.id;
                    const indent = item.level === 1 ? 'pl-0' : item.level === 2 ? 'pl-0' : item.level === 3 ? 'pl-3' : 'pl-5';
                    return (
                      <li key={item.id} className={indent}>
                        <a
                          href={`#${item.id}`}
                          onClick={(e) => scrollToHeading(e, item.id)}
                          className={`block px-3 py-1.5 rounded-lg text-xs transition-all ${
                            isActive
                              ? 'text-gray-900 dark:text-white font-bold bg-white dark:bg-dark-surface border-l-2 border-brand-500 pl-3 shadow-xs'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-dark-surface font-medium'
                          }`}
                        >
                          {item.text}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 italic">
                  {post.content ? 'Loading outline...' : 'Standard article overview.'}
                </p>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-white dark:bg-dark-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-brand-600 text-white p-10 sm:p-14 text-center shadow-2xl overflow-hidden border border-brand-500">
            <h2 className="text-3xl sm:text-4xl font-heading font-black mb-4 text-white">
              Ready to Upgrade Your Product Architecture?
            </h2>
            <p className="text-orange-100 text-base mb-8 leading-relaxed max-w-xl mx-auto font-medium">
              Discuss your engineering requirements directly with our principal solutions team.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white hover:bg-gray-100 text-gray-950 font-bold text-base shadow-xl transition-all hover:scale-105"
            >
              <span>Schedule a Project Call</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPostDetail;
