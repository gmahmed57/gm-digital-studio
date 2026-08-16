import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { cmsService } from '../../services/cmsService';
import { supabase } from '../../services/supabase';
import SEO from '../../components/common/SEO';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Save,
  Upload,
  Briefcase,
  CheckCircle2,
  Image as ImageIcon,
  X,
} from 'lucide-react';

export function AdminPortfolioEditor() {
  const { id } = useParams<{ id?: string }>();
  const { role } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    slug: '',
    category: 'Web Development' as string,
    client: '',
    year: new Date().getFullYear().toString(),
    timeline: '8 Weeks',
    description: '',
    summary: '',
    thumbnailUrl: '',
    heroImageUrl: '',
    challenge: '',
    solution: '',
    metricsString: 'Page Load Speed: 0.4s, Conversion Increase: +185%',
    deliverablesString: 'React Setup, Database Integration, Vercel Edge Hosting',
    techStackString: 'React, Next.js, TypeScript, Tailwind CSS, PostgreSQL',
    resultsString: 'Reduced latency by 85%, Scaled concurrency to 500k users',
    quote: '',
    quoteAuthor: '',
    quoteRole: '',
    quoteCompany: '',
    quoteAvatarUrl: '',
  });

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      setIsLoading(true);
      cmsService.getCaseStudyBySlug(id).then((study) => {
        if (study) {
          setFormData({
            id: study.id,
            title: study.title,
            slug: study.slug,
            category: study.category,
            client: study.client,
            year: study.year,
            timeline: study.timeline,
            description: study.description,
            summary: study.summary,
            thumbnailUrl: study.thumbnailUrl,
            heroImageUrl: study.heroImageUrl,
            challenge: study.challenge,
            solution: study.solution,
            metricsString: study.metrics?.map((m) => `${m.label}: ${m.value}`).join('\n') || '',
            deliverablesString: study.deliverables?.join('\n') || '',
            techStackString: study.techStack?.join('\n') || '',
            resultsString: study.results?.join('\n') || '',
            quote: study.testimonial?.quote || '',
            quoteAuthor: study.testimonial?.author || '',
            quoteRole: study.testimonial?.role || '',
            quoteCompany: study.testimonial?.company || '',
            quoteAvatarUrl: study.testimonial?.avatarUrl || '',
          });
        }
        setIsLoading(false);
      });
    }
  }, [id]);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `portfolio-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('logos').upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

      if (uploadError) {
        console.error('Storage Upload Error:', uploadError);
        alert('Upload failed: ' + uploadError.message);
      } else {
        const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(fileName);
        if (publicUrlData?.publicUrl) {
          setFormData((prev) => ({
            ...prev,
            thumbnailUrl: publicUrlData.publicUrl,
            heroImageUrl: publicUrlData.publicUrl,
          }));
        }
      }
    } catch (err) {
      console.error('Unexpected Upload Error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Upload avatar photo for the endorsement author
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('testimonial-avatars').upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });
      if (uploadError) {
        alert('Avatar upload failed: ' + uploadError.message);
      } else {
        const { data: publicUrlData } = supabase.storage.from('testimonial-avatars').getPublicUrl(fileName);
        if (publicUrlData?.publicUrl) {
          setFormData((prev) => ({ ...prev, quoteAvatarUrl: publicUrlData.publicUrl }));
        }
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.client) {
      alert('Please complete the Title, Slug, and Client Name fields before saving.');
      return;
    }

    setIsLoading(true);

    const metrics = formData.metricsString.split('\n').map((pair) => {
      const [label, value] = pair.split(':').map((s) => s.trim());
      return { label: label || 'Metric', value: value || '100%' };
    });

    const deliverables = formData.deliverablesString.split('\n').map((s) => s.trim()).filter(Boolean);
    const techStack = formData.techStackString.split('\n').map((s) => s.trim()).filter(Boolean);
    const results = formData.resultsString.split('\n').map((s) => s.trim()).filter(Boolean);

    const testimonial = formData.quote
      ? {
          quote: formData.quote,
          author: formData.quoteAuthor || formData.client,
          role: formData.quoteRole || 'Executive',
          company: formData.quoteCompany || formData.client,
          avatarUrl: formData.quoteAvatarUrl || '',
        }
      : undefined;

    const success = await cmsService.saveCaseStudy({
      id: formData.id || formData.slug,
      title: formData.title,
      slug: formData.slug,
      category: formData.category,
      client: formData.client,
      year: formData.year,
      timeline: formData.timeline,
      description: formData.description,
      summary: formData.summary,
      thumbnailUrl: formData.thumbnailUrl,
      heroImageUrl: formData.heroImageUrl || formData.thumbnailUrl,
      challenge: formData.challenge,
      solution: formData.solution,
      metrics,
      deliverables,
      techStack,
      results,
      testimonial,
    });

    setIsLoading(false);

    if (success) {
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } else {
      alert('Failed to save case study.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-6 space-y-6 font-sans">
      <SEO title={isEditing ? `Edit Case Study: ${formData.title}` : 'Add Portfolio Case Study | Admin CMS'} description="Case Study Management Editor" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-dark-surface p-4 rounded-2xl border border-gray-200 dark:border-dark-border shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to={role === 'author' ? "/author/cms?tab=portfolio" : "/admin/cms?tab=portfolio"}
            className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-dark-bg rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-brand-500" />
              {isEditing ? 'Edit Case Study' : 'Add Case Study'}
            </h1>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              Live Route: /portfolio/{formData.slug || 'case-study-slug'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          {saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Saving...' : isEditing ? 'Update Case Study' : 'Publish Case Study'}</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border space-y-4">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-dark-border pb-3">
            Project Overview & Client Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Case Study Title *</label>
              <input
                type="text"
                required
                placeholder="Nexus Real-Time SaaS Analytics Engine"
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
                placeholder="nexus-analytics"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm font-mono bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Client Name *</label>
              <input
                type="text"
                required
                placeholder="Nexus Data Inc."
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
              />
            </div>

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
                  <option value="Web Development">Web Development</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="AI Automation">AI Automation</option>
                  <option value="Mobile Apps">Mobile Apps</option>
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
                      setFormData({ ...formData, category: 'Web Development' });
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
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Timeline & Year</label>
              <input
                type="text"
                placeholder="12 Weeks (2026)"
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Cover Image Upload */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border space-y-4">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-dark-border pb-3 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-brand-500" /> Case Study Featured Banner
          </h3>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="cursor-pointer px-4 py-2.5 bg-gray-900 hover:bg-black dark:bg-brand-600 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-all">
                <Upload className="w-4 h-4" />
                {isUploading ? 'Uploading Image...' : 'Upload Image File'}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              <span className="text-xs text-gray-500">or enter Image URL:</span>
            </div>

            <input
              type="text"
              placeholder="/src/assets/images/portfolio/nexus-analytics.jpg"
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value, heroImageUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
            />

            {formData.thumbnailUrl ? (
              <img
                src={formData.thumbnailUrl}
                alt="Banner Preview"
                className="w-full h-48 object-cover rounded-xl border border-gray-200 dark:border-dark-border"
              />
            ) : null}
          </div>
        </div>

        {/* Project Breakdown Details */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border space-y-4">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-dark-border pb-3">
            Challenge, Engineering Architecture & Results
          </h3>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Executive Summary</label>
            <input
              type="text"
              placeholder="Overview of client scope and deliverables..."
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Client Challenge</label>
              <textarea
                rows={4}
                placeholder="Legacy bottlenecks and architectural hurdles..."
                value={formData.challenge}
                onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                className="w-full p-3 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Digital Studio Solution</label>
              <textarea
                rows={4}
                placeholder="Architectural solution built by GM Digital Studio..."
                value={formData.solution}
                onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                className="w-full p-3 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Key Performance Metrics (One per line, Format: Label: Value)</label>
            <textarea
              rows={3}
              placeholder="Conversion Rate: +140%&#10;Monthly Savings: $50,000"
              value={formData.metricsString}
              onChange={(e) => setFormData({ ...formData, metricsString: e.target.value })}
              className="w-full p-3 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Key Deliverables (One per line)</label>
              <textarea
                rows={4}
                placeholder="Enterprise Web Application&#10;Design System Architecture&#10;CI/CD Pipeline Setup"
                value={formData.deliverablesString}
                onChange={(e) => setFormData({ ...formData, deliverablesString: e.target.value })}
                className="w-full p-3 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Technology Stack (One per line)</label>
              <textarea
                rows={4}
                placeholder="React&#10;Node.js&#10;PostgreSQL&#10;Tailwind CSS"
                value={formData.techStackString}
                onChange={(e) => setFormData({ ...formData, techStackString: e.target.value })}
                className="w-full p-3 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Results (One per line, Format: Value: Label)</label>
            <textarea
              rows={4}
              placeholder="300ms: Faster Page Load Time&#10;$1.2M: Additional Revenue Generated"
              value={formData.resultsString}
              onChange={(e) => setFormData({ ...formData, resultsString: e.target.value })}
              className="w-full p-3 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-dark-border pb-3">
              Client Endorsement / Testimonial
            </h3>

            {/* Quote text */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Endorsement Quote</label>
              <textarea
                rows={3}
                placeholder="GM Digital Studio transformed our complex telemetry into a sleek, enterprise-ready platform."
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                className="w-full p-3 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500 italic"
              />
            </div>

            {/* Author details row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Author Full Name</label>
                <input
                  type="text"
                  placeholder="Marcus Sterling"
                  value={formData.quoteAuthor}
                  onChange={(e) => setFormData({ ...formData, quoteAuthor: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Job Title / Role</label>
                <input
                  type="text"
                  placeholder="Chief Technology Officer"
                  value={formData.quoteRole}
                  onChange={(e) => setFormData({ ...formData, quoteRole: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
                <input
                  type="text"
                  placeholder="Nexus Data Inc."
                  value={formData.quoteCompany}
                  onChange={(e) => setFormData({ ...formData, quoteCompany: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Avatar photo upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Author Avatar Photo</label>
              <div className="flex items-center gap-4">
                {/* Avatar preview */}
                {formData.quoteAvatarUrl ? (
                  <img
                    src={formData.quoteAvatarUrl}
                    alt="Avatar preview"
                    className="w-14 h-14 rounded-full object-cover border-2 border-brand-500/50 flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-dark-bg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400 flex-shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black dark:bg-brand-600 text-white font-semibold text-xs rounded-xl transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    {isUploading ? 'Uploading...' : 'Upload Photo'}
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                  <input
                    type="text"
                    placeholder="or paste image URL..."
                    value={formData.quoteAvatarUrl}
                    onChange={(e) => setFormData({ ...formData, quoteAvatarUrl: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Link
            to="/admin/cms"
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
          >
            {isEditing ? 'Update Case Study' : 'Publish Case Study'}
          </button>
        </div>
      </form>
    </div>
  );
}
