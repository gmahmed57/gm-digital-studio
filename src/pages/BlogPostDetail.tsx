import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, ArrowRight, Tag, MessageSquare, List, Send, CheckCircle2 } from 'lucide-react';
import SEO from '../components/common/SEO';
import { BLOG_POSTS } from '../constants/portfolioData';

import avatar1 from '../assets/avatars/avatar-1.jpg';
import avatar2 from '../assets/avatars/avatar-2.jpg';
import avatar3 from '../assets/avatars/avatar-3.jpg';

interface CommentItem {
  id: string;
  name: string;
  avatarUrl: string;
  date: string;
  content: string;
}

const INITIAL_COMMENTS: Record<string, CommentItem[]> = {
  'building-scalable-react-18-architecture': [
    {
      id: 'c1',
      name: 'James Walker',
      avatarUrl: avatar1,
      date: 'July 21, 2026',
      content: 'Excellent breakdown of React 18 App Router hydration! Server Actions have completely simplified our form submit pipeline.',
    },
    {
      id: 'c2',
      name: 'Elena Rostova',
      avatarUrl: avatar2,
      date: 'July 22, 2026',
      content: 'The section on tokenized CSS utility integration with Tailwind is spot on. Thanks for sharing this architecture guide.',
    },
  ],
};

const BlogPostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const post = BLOG_POSTS.find((p) => p.id === id || p.slug === id) || BLOG_POSTS[0];

  // Comment Form State
  const [comments, setComments] = useState<CommentItem[]>(INITIAL_COMMENTS[post.id] || []);
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentSubmitted, setCommentSubmitted] = useState(false);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !commentText.trim()) return;

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      name: authorName.trim(),
      avatarUrl: avatar3,
      date: 'Just now',
      content: commentText.trim(),
    };

    setComments([newComment, ...comments]);
    setAuthorName('');
    setCommentText('');
    setCommentSubmitted(true);
    setTimeout(() => setCommentSubmitted(false), 4000);
  };

  // Table of Contents Section Headings
  const headings = post.content
    .split('\n\n')
    .filter((p) => p.startsWith('### '))
    .map((p) => p.replace('### ', ''));

  return (
    <div className="w-full bg-white dark:bg-dark-bg text-gray-900 dark:text-white font-sans">
      <SEO
        title={`${post.title} | Blog`}
        description={post.description}
      />

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

          <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight mb-6 leading-tight">
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-3xl mb-8">
            {post.description}
          </p>

          {/* Author Card */}
          <div className="flex items-center gap-4 pt-6 border-t border-white/10">
            <img
              src={post.author.avatarUrl}
              alt={post.author.name}
              className="w-12 h-12 rounded-full object-cover border border-brand-500/50"
            />
            <div>
              <h4 className="text-sm font-bold text-white">{post.author.name}</h4>
              <span className="text-xs text-gray-400">{post.author.role}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cover Image */}
      <section className="py-12 bg-white dark:bg-dark-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 bg-gray-900">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Article Body Content & Table of Contents Sidebar Grid */}
      <section className="py-12 bg-white dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Article Main Body */}
          <div className="lg:col-span-8 space-y-6">
            <div className="prose dark:prose-invert max-w-none text-base leading-relaxed text-gray-700 dark:text-gray-300 space-y-6">
              {post.content.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('### ')) {
                  const headingText = paragraph.replace('### ', '');
                  const headingId = headingText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  return (
                    <h3 id={headingId} key={idx} className="text-2xl font-heading font-bold text-gray-900 dark:text-white pt-6 scroll-mt-24">
                      {headingText}
                    </h3>
                  );
                }
                return (
                  <p key={idx} className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    {paragraph}
                  </p>
                );
              })}
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

            {/* Interactive Comments Section */}
            <div className="pt-12 mt-12 border-t border-gray-200 dark:border-gray-800 space-y-8">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
                  Discussion & Comments ({comments.length})
                </h3>
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="p-6 rounded-3xl bg-gray-50 dark:bg-dark-surface border border-gray-200/80 dark:border-dark-border space-y-4">
                {commentSubmitted && (
                  <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Your comment has been posted successfully!</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Your Name</label>
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
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Your Comment</label>
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
                  <span>Post Comment</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-5 rounded-2xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={comment.avatarUrl}
                          alt={comment.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{comment.name}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{comment.date}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed pl-11">
                      {comment.content}
                    </p>
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

              {headings.length > 0 ? (
                <ul className="space-y-2.5 text-xs">
                  {headings.map((heading, hIdx) => {
                    const headingId = heading.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    return (
                      <li key={hIdx}>
                        <a
                          href={`#${headingId}`}
                          className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors block leading-snug"
                        >
                          {heading}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-xs text-gray-400">Standard article overview.</p>
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
