import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { cmsService, type BlogComment, type AuthorItem, type TestimonialItem } from '../../services/cmsService';
import type { BlogPost, CaseStudy } from '../../types/portfolio';
import SEO from '../../components/common/SEO';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  Briefcase,
  MessageSquare,
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Check,
  Upload,
  X,
  CornerDownRight,
  Quote,
  Star,
} from 'lucide-react';

export function AdminCMS() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const basePath = role === 'author' ? '/author/cms' : '/admin/cms';
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = (searchParams.get('tab') as any) || 'blogs';
  const [activeTab, setActiveTab] = useState<'blogs' | 'portfolio' | 'comments' | 'authors' | 'testimonials'>(
    ['blogs', 'portfolio', 'comments', 'authors', 'testimonials'].includes(defaultTab) ? defaultTab : 'blogs'
  );

  const handleTabChange = (tab: 'blogs' | 'portfolio' | 'comments' | 'authors' | 'testimonials') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Blog State
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [blogSearch, setBlogSearch] = useState('');
  const [blogCategoryFilter, setBlogCategoryFilter] = useState('All');

  // Portfolio State
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [portfolioSearch, setPortfolioSearch] = useState('');
  const [portfolioCategoryFilter, setPortfolioCategoryFilter] = useState('All');

  // Comments State
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [commentFilter, setCommentFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Authors State
  const [authors, setAuthors] = useState<AuthorItem[]>([]);
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<AuthorItem | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [authorForm, setAuthorForm] = useState({
    id: '',
    name: '',
    email: '',
    role: 'Solutions Architect',
    avatar_url: '',
    bio: '',
    password: '',
  });

  // Testimonials State
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [testimonialSearch, setTestimonialSearch] = useState('');
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);

  const [testimonialForm, setTestimonialForm] = useState<TestimonialItem>({
    id: '',
    name: '',
    role: '',
    company: '',
    content: '',
    rating: 5,
    avatarUrl: '',
    displayOrder: 0,
  });

  // Loading & Action State
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadAllData = async () => {
    setIsLoading(true);
    const [fetchedBlogs, fetchedCaseStudies, fetchedComments, fetchedAuthors, fetchedTestimonials] = await Promise.all([
      cmsService.getBlogs(),
      cmsService.getCaseStudies(),
      cmsService.getAllComments(),
      cmsService.getAuthors(),
      cmsService.getTestimonials(),
    ]);
    setBlogs(fetchedBlogs);
    setCaseStudies(fetchedCaseStudies);
    setComments(fetchedComments);
    setAuthors(fetchedAuthors);
    setTestimonials(fetchedTestimonials);
    setIsLoading(false);
  };

  const handleOpenTestimonialModal = (item?: TestimonialItem) => {
    if (item) {
      setEditingTestimonial(item);
      setTestimonialForm(item);
    } else {
      setEditingTestimonial(null);
      setTestimonialForm({
        id: '',
        name: '',
        role: '',
        company: '',
        content: '',
        rating: 5,
        avatarUrl: '',
        displayOrder: testimonials.length,
      });
    }
    setIsTestimonialModalOpen(true);
  };

  const handleTestimonialAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    const publicUrl = await cmsService.uploadTestimonialAvatar(file);
    setIsUploadingAvatar(false);
    if (publicUrl) {
      setTestimonialForm((prev) => ({ ...prev, avatarUrl: publicUrl }));
    } else {
      alert('Failed to upload testimonial avatar to testimonial-avatars storage bucket.');
    }
  };

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonialForm.name || !testimonialForm.content) {
      alert('Please fill out the client name and testimonial content.');
      return;
    }

    const success = await cmsService.saveTestimonial(testimonialForm);
    if (success) {
      setIsTestimonialModalOpen(false);
      triggerSuccess(editingTestimonial ? 'Client testimonial updated!' : 'New client testimonial added!');
      loadAllData();
    } else {
      alert('Failed to save testimonial.');
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      const success = await cmsService.deleteTestimonial(id);
      if (success) {
        triggerSuccess('Testimonial deleted successfully.');
        loadAllData();
      }
    }
  };

  useEffect(() => {
    loadAllData();
    const handleCmsUpdate = () => loadAllData();
    window.addEventListener('gm_cms_updated', handleCmsUpdate);
    return () => window.removeEventListener('gm_cms_updated', handleCmsUpdate);
  }, []);

  useEffect(() => {
    if (role === 'author' && activeTab === 'authors') {
      setActiveTab('blogs');
      setSearchParams({ tab: 'blogs' });
    }
  }, [role, activeTab, setSearchParams]);

  const triggerSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  // Delete Blog
  const handleDeleteBlog = async (id: string) => {
    if (confirm('Are you sure you want to delete this blog post? It will be removed immediately.')) {
      const success = await cmsService.deleteBlog(id);
      if (success) {
        triggerSuccess('Blog article removed.');
        loadAllData();
      }
    }
  };

  // Delete Case Study
  const handleDeleteCaseStudy = async (id: string) => {
    if (confirm('Are you sure you want to delete this case study?')) {
      const success = await cmsService.deleteCaseStudy(id);
      if (success) {
        triggerSuccess('Case study deleted.');
        loadAllData();
      }
    }
  };

  // Comment Actions
  const handleApproveComment = async (id: string) => {
    const success = await cmsService.approveComment(id);
    if (success) {
      triggerSuccess('Comment approved and live on public article!');
      loadAllData();
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (confirm('Delete this comment permanently?')) {
      const success = await cmsService.deleteComment(id);
      if (success) {
        triggerSuccess('Comment deleted.');
        loadAllData();
      }
    }
  };

  const handleSaveReply = async (commentId: string) => {
    if (!replyText.trim()) return;
    const success = await cmsService.replyToComment(commentId, replyText);
    if (success) {
      triggerSuccess('Reply added successfully!');
      setReplyingCommentId(null);
      setReplyText('');
      loadAllData();
    } else {
      alert('Failed to save reply.');
    }
  };

  // Author Modal Actions
  const handleOpenAuthorModal = (author?: AuthorItem) => {
    if (author) {
      setEditingAuthor(author);
      setAuthorForm({
        id: author.id,
        name: author.name,
        email: author.email || '',
        role: author.role || 'Author',
        avatar_url: author.avatar_url || '',
        bio: author.bio || '',
        password: '',
      });
    } else {
      setEditingAuthor(null);
      setAuthorForm({
        id: '',
        name: '',
        email: '',
        role: 'Solutions Architect',
        avatar_url: '',
        bio: '',
        password: '',
      });
    }
    setIsAuthorModalOpen(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const publicUrl = await cmsService.uploadAuthorAvatar(file);
    setIsUploadingAvatar(false);

    if (publicUrl) {
      setAuthorForm((prev) => ({ ...prev, avatar_url: publicUrl }));
    } else {
      alert('Failed to upload author avatar.');
    }
  };

  const handleSaveAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorForm.name) return;

    const success = await cmsService.saveAuthor(authorForm);
    if (success) {
      setIsAuthorModalOpen(false);
      triggerSuccess(editingAuthor ? 'Author profile updated!' : 'New author profile added!');
      loadAllData();
    }
  };

  const handleDeleteAuthor = async (id: string) => {
    if (confirm('Are you sure you want to delete this author profile?')) {
      const success = await cmsService.deleteAuthor(id);
      if (success) {
        triggerSuccess('Author profile removed.');
        loadAllData();
      }
    }
  };

  // Dynamic categories list based on existing database content + presets
  const blogCategories = Array.from(
    new Set([
      'Engineering',
      'UI/UX Design',
      'AI & Automation',
      'Strategy',
      ...blogs.map((b) => b.category),
    ])
  ).filter(Boolean);

  const portfolioCategories = Array.from(
    new Set([
      'Web Development',
      'UI/UX Design',
      'AI Automation',
      'Mobile Apps',
      ...caseStudies.map((c) => c.category),
    ])
  ).filter(Boolean);

  // Filtered lists
  const filteredBlogs = blogs
    .filter((b) => {
      const matchesSearch = b.title.toLowerCase().includes(blogSearch.toLowerCase()) || b.description.toLowerCase().includes(blogSearch.toLowerCase());
      const matchesCategory = blogCategoryFilter === 'All' || b.category === blogCategoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const dateA = Date.parse(a.publishedAt) || 0;
      const dateB = Date.parse(b.publishedAt) || 0;
      return dateB - dateA;
    });

  const filteredCaseStudies = caseStudies
    .filter((c) => {
      const matchesSearch = c.title.toLowerCase().includes(portfolioSearch.toLowerCase()) || c.client.toLowerCase().includes(portfolioSearch.toLowerCase());
      const matchesCategory = portfolioCategoryFilter === 'All' || c.category === portfolioCategoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const yearA = parseInt(a.year, 10) || 0;
      const yearB = parseInt(b.year, 10) || 0;
      return yearB - yearA;
    });

  const filteredComments = comments.filter((c) => {
    if (commentFilter === 'pending') return c.status === 'pending';
    if (commentFilter === 'approved') return c.status === 'approved';
    return true;
  });

  const pendingCommentsCount = comments.filter((c) => c.status === 'pending').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <SEO title="Admin Blog & CMS Management" description="Content Management System for Blog Posts, Case Studies, Authors, and Comment Moderation" />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-brand-600 dark:text-brand-500" />
            Content Management System (CMS)
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage agency blog articles, portfolio case studies, authors, and moderate public visitor comments in real time.
          </p>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-dark-surface p-1 rounded-xl border border-gray-200 dark:border-dark-border flex-wrap">
          <button
            onClick={() => handleTabChange('blogs')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'blogs'
                ? 'bg-white dark:bg-dark-bg text-brand-600 dark:text-brand-500 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Articles ({blogs.length})
          </button>

          <button
            onClick={() => handleTabChange('portfolio')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'portfolio'
                ? 'bg-white dark:bg-dark-bg text-brand-600 dark:text-brand-500 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Case Studies ({caseStudies.length})
          </button>

          {role !== 'author' && (
            <button
              onClick={() => handleTabChange('authors')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'authors'
                  ? 'bg-white dark:bg-dark-bg text-brand-600 dark:text-brand-500 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              Authors ({authors.length})
            </button>
          )}

          <button
            onClick={() => handleTabChange('comments')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 relative ${
              activeTab === 'comments'
                ? 'bg-white dark:bg-dark-bg text-brand-600 dark:text-brand-500 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Comments
            {pendingCommentsCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {pendingCommentsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange('testimonials')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'testimonials'
                ? 'bg-white dark:bg-dark-bg text-brand-600 dark:text-brand-500 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Quote className="w-4 h-4" />
            Testimonials ({testimonials.length})
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold text-sm">{actionSuccess}</span>
        </div>
      )}

      {/* TAB 1: BLOG CMS */}
      {activeTab === 'blogs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-100 dark:border-dark-border">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={blogSearch}
                  onChange={(e) => setBlogSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg outline-none focus:border-brand-500"
                />
              </div>

              <select
                value={blogCategoryFilter}
                onChange={(e) => setBlogCategoryFilter(e.target.value)}
                className="py-2 px-3 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg outline-none focus:border-brand-500 text-gray-850"
              >
                <option value="All">All Categories</option>
                {blogCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <Link
              to={`${basePath}/blog/new`}
              className="w-full sm:w-auto px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Blog Article
            </Link>
          </div>

          <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading articles...</div>
            ) : filteredBlogs.length === 0 ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                No blog articles found. Click "Create Blog Article" to add one!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-dark-bg/60 border-b border-gray-100 dark:border-dark-border text-gray-500">
                    <tr>
                      <th className="p-4 font-semibold">Article Title</th>
                      <th className="p-4 font-semibold">Category</th>
                      <th className="p-4 font-semibold">Author</th>
                      <th className="p-4 font-semibold">Read Time</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                    {filteredBlogs.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-bg/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {post.imageUrl ? (
                              <img src={post.imageUrl} alt={post.title} className="w-12 h-10 object-cover rounded-lg flex-shrink-0" />
                            ) : null}
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white line-clamp-1">{post.title}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">/blog/{post.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 whitespace-nowrap inline-block">
                            {post.category}
                          </span>
                        </td>
                        <td className="p-4 text-gray-700 dark:text-gray-300">
                          <div className="font-medium text-xs">{post.author?.name || 'Studio Admin'}</div>
                          <div className="text-xs text-gray-500">{post.publishedAt}</div>
                        </td>
                        <td className="p-4 text-gray-600 dark:text-gray-400 text-xs font-mono">{post.readTime}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-gray-500 hover:text-brand-500 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg"
                              title="View Live Article"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => navigate(`${basePath}/blog/edit/${post.slug}`)}
                              className="p-1.5 text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30"
                              title="Edit Article in Full Page Editor"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBlog(post.id)}
                              className="p-1.5 text-rose-600 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                              title="Delete Article"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PORTFOLIO CASE STUDIES CMS */}
      {activeTab === 'portfolio' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-100 dark:border-dark-border">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search case studies..."
                  value={portfolioSearch}
                  onChange={(e) => setPortfolioSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg outline-none focus:border-brand-500"
                />
              </div>

              <select
                value={portfolioCategoryFilter}
                onChange={(e) => setPortfolioCategoryFilter(e.target.value)}
                className="py-2 px-3 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg outline-none focus:border-brand-500 text-gray-850"
              >
                <option value="All">All Categories</option>
                {portfolioCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <Link
              to={`${basePath}/portfolio/new`}
              className="w-full sm:w-auto px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Case Study
            </Link>
          </div>

          <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading case studies...</div>
            ) : filteredCaseStudies.length === 0 ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                No case studies found. Click "Add Case Study" to create one!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-dark-bg/60 border-b border-gray-100 dark:border-dark-border text-gray-500">
                    <tr>
                      <th className="p-4 font-semibold">Project Title</th>
                      <th className="p-4 font-semibold">Client Name</th>
                      <th className="p-4 font-semibold">Category</th>
                      <th className="p-4 font-semibold">Timeline</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                    {filteredCaseStudies.map((study) => (
                      <tr key={study.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-bg/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {study.thumbnailUrl ? (
                              <img src={study.thumbnailUrl} alt={study.title} className="w-12 h-10 object-cover rounded-lg flex-shrink-0" />
                            ) : null}
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white line-clamp-1">{study.title}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">/portfolio/{study.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-gray-800 dark:text-gray-200">{study.client}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 whitespace-nowrap inline-block">
                            {study.category}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-mono text-gray-500">{study.timeline} ({study.year})</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`/portfolio/${study.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-gray-500 hover:text-brand-500 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg"
                              title="View Live Case Study"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => navigate(`${basePath}/portfolio/edit/${study.slug}`)}
                              className="p-1.5 text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30"
                              title="Edit Case Study in Full Page Editor"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCaseStudy(study.id)}
                              className="p-1.5 text-rose-600 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                              title="Delete Case Study"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AUTHORS MANAGEMENT TAB */}
      {activeTab === 'authors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-100 dark:border-dark-border">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Studio Authors & Team Profiles</h3>
              <p className="text-xs text-gray-500">Manage author profiles assigned to blog posts and insights.</p>
            </div>

            <button
              onClick={() => handleOpenAuthorModal()}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Author Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {authors.map((author) => (
              <div
                key={author.id}
                className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-gray-100 dark:border-dark-border space-y-3 relative group"
              >
                <div className="flex items-center gap-3">
                  {author.avatar_url ? (
                    <img src={author.avatar_url} alt={author.name} className="w-12 h-12 rounded-full object-cover border border-brand-500/40" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-600 font-bold flex items-center justify-center text-lg border border-brand-500/20">
                      {author.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{author.name}</h4>
                    <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">{author.role}</p>
                    {author.email && <div className="text-[11px] text-gray-400 font-mono">{author.email}</div>}
                  </div>
                </div>

                {author.bio && <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{author.bio}</p>}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-dark-border">
                  <button
                    onClick={() => handleOpenAuthorModal(author)}
                    className="p-1.5 text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAuthor(author.id)}
                    className="p-1.5 text-rose-600 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: COMMENT MODERATION INBOX */}
      {activeTab === 'comments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-100 dark:border-dark-border">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCommentFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${commentFilter === 'all' ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-gray-400'}`}
              >
                All Comments ({comments.length})
              </button>
              <button
                onClick={() => setCommentFilter('pending')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${commentFilter === 'pending' ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-gray-400'}`}
              >
                Pending ({pendingCommentsCount})
              </button>
              <button
                onClick={() => setCommentFilter('approved')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${commentFilter === 'approved' ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-gray-400'}`}
              >
                Approved ({comments.filter((c) => c.status === 'approved').length})
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredComments.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border text-gray-500">
                No visitor comments in this filter.
              </div>
            ) : (
              filteredComments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">{comment.name}</span>
                      {comment.email && <span className="text-xs text-gray-500 font-mono">({comment.email})</span>}
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          comment.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                        }`}
                      >
                        {comment.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{comment.content}"</p>
                    <div className="text-xs text-gray-400">Blog Article ID: {comment.blog_id} • {new Date(comment.created_at).toLocaleDateString()}</div>
                    
                    {/* Existing Reply Display */}
                    {comment.admin_reply && (
                      <div className="mt-2 pl-4 border-l-2 border-brand-500 text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <CornerDownRight className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white">Admin Reply: </span>
                          "{comment.admin_reply}"
                          {comment.admin_reply_at && (
                            <span className="text-[10px] text-gray-400 block mt-0.5">
                              {new Date(comment.admin_reply_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Reply Input Form */}
                    {replyingCommentId === comment.id ? (
                      <div className="mt-3 space-y-2 max-w-xl">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type admin reply..."
                          className="w-full p-2 text-xs bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg focus:border-brand-500 outline-none text-gray-900 dark:text-white"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveReply(comment.id)}
                            className="px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg"
                          >
                            Save Reply
                          </button>
                          <button
                            onClick={() => {
                              setReplyingCommentId(null);
                              setReplyText('');
                            }}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-dark-bg/60 dark:hover:bg-dark-bg text-gray-600 dark:text-gray-400 text-xs font-semibold rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      comment.status === 'approved' && (
                        <button
                          onClick={() => {
                            setReplyingCommentId(comment.id);
                            setReplyText(comment.admin_reply || '');
                          }}
                          className="mt-2 text-xs text-brand-600 dark:text-brand-500 hover:underline font-semibold flex items-center gap-1"
                        >
                          <CornerDownRight className="w-3 h-3" />
                          {comment.admin_reply ? 'Edit Reply' : 'Reply to comment'}
                        </button>
                      )
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 sm:self-start">
                    {comment.status === 'pending' && (
                      <button
                        onClick={() => handleApproveComment(comment.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-600 text-xs font-semibold rounded-lg flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TESTIMONIALS TAB */}
      {activeTab === 'testimonials' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search testimonials by client name or company..."
                value={testimonialSearch}
                onChange={(e) => setTestimonialSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-xs text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-brand-500 font-medium"
              />
            </div>

            <button
              onClick={() => handleOpenTestimonialModal()}
              className="w-full sm:w-auto px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Testimonial
            </button>
          </div>

          <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-gray-400 italic">Loading testimonials...</div>
            ) : testimonials.filter((t) =>
                t.name.toLowerCase().includes(testimonialSearch.toLowerCase()) ||
                t.company.toLowerCase().includes(testimonialSearch.toLowerCase()) ||
                t.content.toLowerCase().includes(testimonialSearch.toLowerCase())
              ).length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400 space-y-2">
                <Quote className="w-8 h-8 mx-auto text-gray-300" />
                <p>No testimonials found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Role & Company</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4">Testimonial Quote</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-border text-xs">
                    {testimonials
                      .filter((t) =>
                        t.name.toLowerCase().includes(testimonialSearch.toLowerCase()) ||
                        t.company.toLowerCase().includes(testimonialSearch.toLowerCase()) ||
                        t.content.toLowerCase().includes(testimonialSearch.toLowerCase())
                      )
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-surface/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                                alt={item.name}
                                className="w-9 h-9 rounded-full object-cover border border-brand-500/30 flex-shrink-0"
                              />
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white">{item.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400">
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{item.role}</p>
                            <p className="text-[11px] text-brand-600 dark:text-brand-400 font-bold">{item.company}</p>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center space-x-0.5">
                              {Array.from({ length: item.rating }).map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 max-w-sm">
                            <p className="text-gray-700 dark:text-gray-300 italic line-clamp-2">"{item.content}"</p>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenTestimonialModal(item)}
                                className="p-1.5 rounded-lg text-gray-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors cursor-pointer"
                                title="Edit Testimonial"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTestimonial(item.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                                title="Delete Testimonial"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AUTHOR EDIT / ADD MODAL */}
      {isAuthorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-surface w-full max-w-md rounded-2xl border border-gray-100 dark:border-dark-border shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-border pb-3">
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                {editingAuthor ? 'Edit Author Profile' : 'Add New Author Profile'}
              </h3>
              <button onClick={() => setIsAuthorModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAuthor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Author Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={authorForm.name}
                  onChange={(e) => setAuthorForm({ ...authorForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500 font-medium text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="alex@gmdigitalstudio.com"
                  value={authorForm.email}
                  onChange={(e) => setAuthorForm({ ...authorForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500 font-medium text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Password {editingAuthor ? '(Optional)' : '*'}
                </label>
                <input
                  type="password"
                  required={!editingAuthor}
                  placeholder={editingAuthor ? "Leave blank to keep current password" : "Minimum 6 characters"}
                  value={authorForm.password}
                  onChange={(e) => setAuthorForm({ ...authorForm, password: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Role / Designation</label>
                <input
                  type="text"
                  placeholder="Principal Solutions Architect"
                  value={authorForm.role}
                  onChange={(e) => setAuthorForm({ ...authorForm, role: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Bio / Description</label>
                <textarea
                  rows={3}
                  placeholder="Short professional bio shown on author cards and blog posts..."
                  value={authorForm.bio}
                  onChange={(e) => setAuthorForm({ ...authorForm, bio: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500 resize-none text-gray-900 dark:text-white"
                />
              </div>

              {/* Avatar Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Author Profile Avatar</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-3.5 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    {isUploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                  <input
                    type="text"
                    placeholder="URL or /src/assets/avatars/..."
                    value={authorForm.avatar_url}
                    onChange={(e) => setAuthorForm({ ...authorForm, avatar_url: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-dark-border">
                <button
                  type="button"
                  onClick={() => setIsAuthorModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl shadow-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* TESTIMONIAL EDIT / ADD MODAL */}
      {isTestimonialModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-surface w-full max-w-lg rounded-2xl border border-gray-100 dark:border-dark-border shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-border pb-3">
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  {editingTestimonial ? 'Edit Client Testimonial' : 'Add New Client Testimonial'}
                </h3>
                <button onClick={() => setIsTestimonialModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTestimonial} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Client Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={testimonialForm.name}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500 font-medium text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Job Title / Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Head of Product"
                      value={testimonialForm.role}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Vanguard Tech"
                      value={testimonialForm.company}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, company: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Star Rating (1 - 5 Stars)</label>
                  <select
                    value={testimonialForm.rating}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500 text-gray-900 dark:text-white font-bold cursor-pointer"
                  >
                    <option value={5}>5 Stars (★★★★★)</option>
                    <option value={4}>4 Stars (★★★★☆)</option>
                    <option value={3}>3 Stars (★★★☆☆)</option>
                    <option value={2}>2 Stars (★★☆☆☆)</option>
                    <option value={1}>1 Star (★☆☆☆☆)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Testimonial Quote Content *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write the client testimonial quote..."
                    value={testimonialForm.content}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, content: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500 leading-relaxed text-gray-900 dark:text-white"
                  />
                </div>

                {/* Avatar Photo Upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Client Avatar Photo</label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer px-3.5 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      {isUploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                      <input type="file" accept="image/*" onChange={handleTestimonialAvatarUpload} className="hidden" />
                    </label>
                    <input
                      type="text"
                      placeholder="Image URL..."
                      value={testimonialForm.avatarUrl}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, avatarUrl: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-dark-border">
                  <button
                    type="button"
                    onClick={() => setIsTestimonialModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    Save Testimonial
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
