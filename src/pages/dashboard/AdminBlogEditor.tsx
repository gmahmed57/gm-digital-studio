import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { cmsService, type AuthorItem } from '../../services/cmsService';
import { supabase } from '../../services/supabase';
import SEO from '../../components/common/SEO';
import { useAuth } from '../../context/AuthContext';
import { BlogContentRenderer } from '../../components/common/BlogContentRenderer';
import { resolveAssetUrl, handleImageError } from '../../utils/imageUtils';
import {
  ArrowLeft,
  Save,
  Upload,
  Sparkles,
  Eye,
  Edit3,
  CheckCircle2,
  Image as ImageIcon,
  UserCheck,
  FileCode,
  X,
} from 'lucide-react';

const PRESET_IMAGES = [
  { label: 'Engineering & Technology', url: '/src/assets/images/blog/blog-react.jpg' },
  { label: 'UI/UX Design Architecture', url: '/src/assets/images/blog/blog-design.jpg' },
  { label: 'Cloud Infrastructure & Edge', url: '/src/assets/images/blog/blog-supabase.jpg' },
];

// Convert plain markdown to HTML for legacy content loading
function convertMarkdownToHtml(md: string): string {
  if (!md) return '';

  // Already HTML — return as-is
  if (/<(h[1-6]|p|ul|ol|li|blockquote|table|div|strong|em)\b[^>]*>/i.test(md)) {
    return md;
  }

  let html = md;
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  const blocks = html.split(/\n\n+/);
  const processed = blocks.map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (
      trimmed.startsWith('<h1') || trimmed.startsWith('<h2') || trimmed.startsWith('<h3') ||
      trimmed.startsWith('<blockquote') || trimmed.startsWith('<ul') ||
      trimmed.startsWith('<ol') || trimmed.startsWith('<table')
    ) {
      return trimmed;
    }
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const items = trimmed
        .split(/\n/)
        .map((line) => `<li>${line.replace(/^[-*]\s+/, '')}</li>`)
        .join('');
      return `<ul>${items}</ul>`;
    }
    return `<p>${trimmed}</p>`;
  });

  return processed.filter(Boolean).join('\n');
}

export function AdminBlogEditor() {
  const { id } = useParams<{ id?: string }>();
  const { role, user } = useAuth();
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const htmlTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeView, setActiveView] = useState<'editor' | 'split' | 'preview'>('split');
  const [previewContent, setPreviewContent] = useState('');
  const [editorMode, setEditorMode] = useState<'visual' | 'html'>('visual');

  const [showCustomCategory, setShowCustomCategory] = useState(false);

  const [authors, setAuthors] = useState<AuthorItem[]>([]);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    slug: '',
    category: 'Engineering' as string,
    description: '',
    imageUrl: '',
    readTime: '5 min read',
    publishedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    authorName: import.meta.env.VITE_ADMIN_EMAIL || 'Studio Admin',
    authorRole: 'Studio Administrator',
    authorAvatar: '',
    tagsString: '',
  });

  // Initialize Quill editor
  useEffect(() => {
    if (!editorContainerRef.current || quillRef.current) return;

    const quill = new Quill(editorContainerRef.current, {
      theme: 'snow',
      placeholder: 'Begin writing your article here...',
      modules: {
        toolbar: [
          [{ header: 1 }, { header: 2 }, { header: 3 }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'code-block'],
          ['link', 'image'],
          [{ align: [] }],
          ['clean'],
        ],
        history: {
          delay: 1000,
          maxStack: 100,
          userOnly: true,
        },
      },
    });

    quill.on('text-change', () => {
      setPreviewContent(quill.root.innerHTML);
    });

    quillRef.current = quill;
  }, []);

  // Load authors and existing article
  useEffect(() => {
    cmsService.getAuthors().then((list) => {
      if (list && list.length > 0) setAuthors(list);
    });

    if (id) {
      setIsEditing(true);
      setIsLoading(true);
      cmsService.getBlogBySlug(id).then((post) => {
        if (post) {
          const htmlContent = convertMarkdownToHtml(post.content || '');
          setFormData({
            id: post.id,
            title: post.title,
            slug: post.slug,
            category: post.category,
            description: post.description,
            imageUrl: post.imageUrl || '',
            readTime: post.readTime,
            publishedAt: post.publishedAt,
            authorName: post.author?.name || (import.meta.env.VITE_ADMIN_EMAIL || 'Studio Admin'),
            authorRole: post.author?.role || 'Studio Administrator',
            authorAvatar: post.author?.avatarUrl || '',
            tagsString: post.tags?.join(', ') || '',
          });

          // Set Quill content — wait for next tick so Quill is initialized
          setTimeout(() => {
            if (quillRef.current) {
              quillRef.current.root.innerHTML = htmlContent;
              setPreviewContent(htmlContent);
            }
          }, 100);
        }
        setIsLoading(false);
      });
    }
  }, [id, role, user]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const generatedSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.id ? prev.slug : generatedSlug,
    }));
  };

  const handleAuthorSelect = (name: string) => {
    const selected = authors.find((a) => a.name === name);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        authorName: selected.name,
        authorRole: selected.role,
        authorAvatar: selected.avatar_url || '',
      }));
    } else {
      setFormData((prev) => ({ ...prev, authorName: name }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `article-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('article-covers').upload(fileName, file, { cacheControl: '3600', upsert: true });
      if (uploadError) {
        alert('Image upload failed: ' + uploadError.message);
      } else {
        const { data: publicUrlData } = supabase.storage.from('article-covers').getPublicUrl(fileName);
        if (publicUrlData?.publicUrl) {
          setFormData((prev) => ({ ...prev, imageUrl: publicUrlData.publicUrl }));
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const content =
      editorMode === 'html' && htmlTextareaRef.current
        ? htmlTextareaRef.current.value
        : quillRef.current
          ? quillRef.current.root.innerHTML
          : '';

    if (!formData.title || !formData.slug || !content || content === '<p><br></p>') {
      alert('Please complete the Title, URL Slug, and Article Content before publishing.');
      return;
    }

    setIsLoading(true);
    const tags = formData.tagsString.split(',').map((t) => t.trim()).filter(Boolean);

    const success = await cmsService.saveBlog({
      id: formData.id || formData.slug,
      title: formData.title,
      slug: formData.slug,
      category: formData.category,
      description: formData.description,
      content,
      imageUrl: formData.imageUrl,
      readTime: formData.readTime,
      publishedAt: formData.publishedAt || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      author: {
        name: formData.authorName,
        role: formData.authorRole,
        avatarUrl: formData.authorAvatar,
      },
      tags,
    });

    setIsLoading(false);

    if (success) {
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } else {
      alert('Failed to publish article. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-6 space-y-6 font-sans">
      <SEO
        title={isEditing ? `Edit Article: ${formData.title}` : 'Create Article | Content Management System'}
        description="Enterprise Article Editor"
      />

      {/* Quill Snow Theme Custom Overrides */}
      <style>{`
        .ql-toolbar.ql-snow {
          border-radius: 12px 12px 0 0;
          border-color: #e5e7eb;
          background: #f9fafb;
          padding: 8px;
          position: sticky;
          top: 0;
          z-index: 20;
        }
        .dark .ql-toolbar.ql-snow {
          border-color: #242429;
          background: #131316;
        }
        .dark .ql-toolbar .ql-stroke { stroke: #9ca3af; }
        .dark .ql-toolbar .ql-fill { fill: #9ca3af; }
        .dark .ql-toolbar .ql-picker { color: #9ca3af; }
        .dark .ql-toolbar button:hover .ql-stroke,
        .dark .ql-toolbar button.ql-active .ql-stroke { stroke: #f9fafb; }
        .ql-container.ql-snow {
          border-radius: 0 0 12px 12px;
          border-color: #e5e7eb;
          background: #f9fafb;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          line-height: 1.8;
        }
        .dark .ql-container.ql-snow {
          border-color: #242429;
          background: #0a0a0b;
        }
        .ql-editor {
          min-height: 450px;
          max-height: 600px;
          overflow-y: auto;
          color: #111827;
          padding: 20px 24px;
        }
        .dark .ql-editor { color: #f9fafb; }
        .ql-editor h1 { color: #000000 !important; font-size: 2rem; font-weight: 900; margin-bottom: 12px; margin-top: 20px; }
        .ql-editor h2 { color: #000000 !important; font-size: 1.5rem; font-weight: 800; margin-bottom: 10px; margin-top: 18px; }
        .ql-editor h3 { color: #000000 !important; font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; margin-top: 14px; }
        .dark .ql-editor h1, .dark .ql-editor h2, .dark .ql-editor h3 { color: #ffffff !important; }
        .ql-editor p { margin-bottom: 12px; }
        .ql-editor ul, .ql-editor ol { margin-bottom: 12px; padding-left: 20px; }
        .ql-editor blockquote { border-left: 4px solid #f94a00; padding: 12px 16px; background: rgba(249,74,0,0.05); color: #374151; border-radius: 0 8px 8px 0; margin: 16px 0; font-style: italic; }
        .ql-editor a { color: #f94a00; text-decoration: underline; }
        .ql-snow .ql-picker.ql-header .ql-picker-label::before,
        .ql-snow .ql-picker.ql-header .ql-picker-item::before { content: 'Paragraph'; }
        .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before { content: 'Heading 1'; }
        .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before { content: 'Heading 2'; }
        .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before { content: 'Heading 3'; }
      `}</style>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-dark-surface p-4 rounded-2xl border border-gray-200 dark:border-dark-border shadow-xs">
        <div className="flex items-center gap-3">
          <Link to={role === 'author' ? "/author/cms?tab=blogs" : "/admin/cms?tab=blogs"} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-dark-bg rounded-xl transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-500" />
              {isEditing ? 'Edit Article' : 'Create & Publish Article'}
            </h1>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              Route: /blog/{formData.slug || 'article-slug'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center bg-gray-100 dark:bg-dark-bg p-1 rounded-xl border border-gray-200 dark:border-dark-border text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveView('editor')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${activeView === 'editor' ? 'bg-white dark:bg-dark-surface text-brand-600 dark:text-brand-400 shadow-xs' : 'text-gray-500'}`}
            >
              <Edit3 className="w-3.5 h-3.5" /> Editor
            </button>
            <button
              type="button"
              onClick={() => setActiveView('split')}
              className={`px-3 py-1.5 rounded-lg hidden lg:flex items-center gap-1.5 transition-all cursor-pointer ${activeView === 'split' ? 'bg-white dark:bg-dark-surface text-brand-600 dark:text-brand-400 shadow-xs' : 'text-gray-500'}`}
            >
              <FileCode className="w-3.5 h-3.5" /> Split View
            </button>
            <button
              type="button"
              onClick={() => setActiveView('preview')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${activeView === 'preview' ? 'bg-white dark:bg-dark-surface text-brand-600 dark:text-brand-400 shadow-xs' : 'text-gray-500'}`}
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full sm:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {saveSuccess ? (
              <><CheckCircle2 className="w-4 h-4" /><span>Published</span></>
            ) : (
              <><Save className="w-4 h-4" /><span>{isLoading ? 'Saving...' : isEditing ? 'Update Article' : 'Publish Article'}</span></>
            )}
          </button>
        </div>
      </div>

      {/* Main Editor Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT: EDITOR PANEL */}
        <div className={`space-y-6 ${activeView === 'preview' ? 'hidden' : activeView === 'split' ? 'lg:col-span-7' : 'lg:col-span-12'}`}>

          {/* Article Info Card */}
          <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border space-y-4">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-dark-border pb-3">
              Article Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Building Enterprise Web Architectures"
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500 font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="building-enterprise-web-architectures"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm font-mono bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                {!showCustomCategory ? (
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM') {
                        setShowCustomCategory(true);
                        setFormData({ ...formData, category: '' });
                      } else {
                        setFormData({ ...formData, category: e.target.value });
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="AI & Automation">AI & Automation</option>
                    <option value="Strategy">Strategy</option>
                    <option value="CUSTOM" className="font-bold text-brand-600">+ Add Custom Category...</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type custom category..."
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="flex-1 px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomCategory(false);
                        setFormData({ ...formData, category: 'Engineering' });
                      }}
                      className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-all"
                      title="Cancel custom category"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Read Time</label>
                <input
                  type="text"
                  placeholder="5 min read"
                  value={formData.readTime}
                  onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Publish Date</label>
                <input
                  type="text"
                  placeholder="August 03, 2026"
                  value={formData.publishedAt}
                  onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Subtitle / Summary</label>
              <input
                type="text"
                placeholder="Key takeaways and summary of this article..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Author Card */}
          <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border space-y-4">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-dark-border pb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-brand-500" /> Author Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Select Author</label>
                <select
                  value={formData.authorName}
                  onChange={(e) => handleAuthorSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500 font-medium"
                >
                  {authors.map((author) => (
                    <option key={author.name} value={author.name}>{author.name} ({author.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Author Name</label>
                <input
                  type="text"
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Featured Image Card */}
          <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border space-y-4">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-dark-border pb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-brand-500" /> Featured Image
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="cursor-pointer px-4 py-2.5 bg-gray-900 hover:bg-black dark:bg-brand-600 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-all">
                  <Upload className="w-4 h-4" />
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                <span className="text-xs text-gray-500">or enter URL:</span>
              </div>
              <input
                type="text"
                placeholder="https://... or /src/assets/images/..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
              />
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-400 self-center">Presets:</span>
                {PRESET_IMAGES.map((img) => (
                  <button
                    key={img.url}
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: img.url })}
                    className="px-2.5 py-1 text-xs bg-gray-100 dark:bg-dark-bg hover:bg-brand-500/10 hover:text-brand-500 rounded-lg transition-all"
                  >
                    {img.label}
                  </button>
                ))}
              </div>
              {formData.imageUrl && (
                <img
                  src={resolveAssetUrl(formData.imageUrl, 'blog', formData.title || formData.slug)}
                  alt="Preview"
                  onError={(e) => handleImageError(e, 'blog', formData.title || formData.slug)}
                  className="w-full h-36 object-cover rounded-xl border border-gray-200 dark:border-dark-border"
                />
              )}
            </div>
          </div>

          {/* WYSIWYG / HTML Code Editor */}
          <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden">
            {/* Card header with Visual/HTML toggle */}
            <div className="px-6 py-3 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Article Content Editor
              </h3>
              {/* Visual ↔ HTML toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-dark-bg rounded-lg p-0.5 border border-gray-200 dark:border-dark-border">
                <button
                  type="button"
                  onClick={() => {
                    if (editorMode === 'html' && quillRef.current && htmlTextareaRef.current) {
                      // HTML → Visual: push textarea content into Quill
                      quillRef.current.root.innerHTML = htmlTextareaRef.current.value;
                      setPreviewContent(htmlTextareaRef.current.value);
                    }
                    setEditorMode('visual');
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    editorMode === 'visual'
                      ? 'bg-white dark:bg-dark-surface text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Visual
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (editorMode === 'visual' && quillRef.current && htmlTextareaRef.current) {
                      // Visual → HTML: pull Quill HTML into textarea
                      htmlTextareaRef.current.value = quillRef.current.root.innerHTML;
                    }
                    setEditorMode('html');
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    editorMode === 'html'
                      ? 'bg-white dark:bg-dark-surface text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  &lt;/&gt; HTML
                </button>
              </div>
            </div>

            {/* Quill visual editor — hidden (not unmounted) when in HTML mode so Quill state persists */}
            <div
              ref={editorContainerRef}
              className="min-h-[450px]"
              style={{ display: editorMode === 'visual' ? 'block' : 'none' }}
            />

            {/* HTML textarea — only visible in HTML mode */}
            {editorMode === 'html' && (
              <textarea
                ref={htmlTextareaRef}
                spellCheck={false}
                defaultValue={quillRef.current?.root.innerHTML ?? ''}
                onChange={(e) => setPreviewContent(e.target.value)}
                className="w-full min-h-[450px] p-5 font-mono text-xs leading-relaxed text-green-400 bg-gray-950 dark:bg-gray-950 outline-none resize-y border-0 focus:ring-0"
                placeholder="<h2>Your HTML here...</h2>"
              />
            )}
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-gray-200 dark:border-dark-border">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              placeholder="React, Next.js, Architecture, Performance"
              value={formData.tagsString}
              onChange={(e) => setFormData({ ...formData, tagsString: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* RIGHT: LIVE PREVIEW PANEL */}
        <div className={`space-y-6 ${activeView === 'editor' ? 'hidden' : activeView === 'split' ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
          <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border space-y-6 sticky top-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-border pb-3">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand-500" /> Live Render Preview
              </h3>
              <span className="text-xs bg-emerald-500/10 text-emerald-600 font-semibold px-2.5 py-1 rounded-full">Live</span>
            </div>

            <div className="border border-gray-100 dark:border-dark-border p-5 rounded-2xl bg-white dark:bg-dark-bg space-y-4 max-h-[80vh] overflow-y-auto">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-brand-500/10 text-brand-600">
                {formData.category}
              </span>

              <h1 className="text-2xl font-black text-black dark:text-white leading-tight">
                {formData.title || 'Untitled Article'}
              </h1>

              {formData.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 italic border-l-2 border-brand-500 pl-3">
                  {formData.description}
                </p>
              )}

              <div className="flex items-center gap-3 text-xs text-gray-500 border-t border-b border-gray-100 dark:border-dark-border py-3">
                <span className="font-semibold text-gray-900 dark:text-white">{formData.authorName}</span>
                <span>•</span>
                <span>{formData.publishedAt}</span>
                <span>•</span>
                <span className="font-mono">{formData.readTime}</span>
              </div>

              {formData.imageUrl && (
                <img src={formData.imageUrl} alt="Cover" className="w-full h-40 object-cover rounded-xl" />
              )}

              <BlogContentRenderer content={previewContent || '<p class="text-gray-400 italic">Start typing in the editor to see a preview...</p>'} />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
