import { supabase } from './supabase';
import type { BlogPost, CaseStudy } from '../types/portfolio';
import { CASE_STUDIES } from '../constants/portfolioData';

export interface AuthorItem {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
}

export interface BlogComment {
  id: string;
  blog_id: string;
  name: string;
  email?: string;
  content: string;
  status: 'pending' | 'approved';
  admin_reply?: string;
  admin_reply_at?: string;
  created_at: string;
}

export const cmsService = {
  // ==================== BLOG POSTS ====================
  async getBlogs(): Promise<BlogPost[]> {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching blogs:', error);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        category: row.category,
        description: row.description,
        content: row.content,
        imageUrl: row.image_url,
        readTime: row.read_time,
        publishedAt: row.published_at,
        author: row.author || { name: 'GM Digital Studio', role: 'Solutions Architect', avatarUrl: '' },
        tags: row.tags || [],
      }));
    } catch (err) {
      console.error('Unexpected error fetching blogs:', err);
      return [];
    }
  },

  async getBlogBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        slug: data.slug,
        title: data.title,
        category: data.category,
        description: data.description,
        content: data.content,
        imageUrl: data.image_url,
        readTime: data.read_time,
        publishedAt: data.published_at,
        author: data.author || { name: 'GM Digital Studio', role: 'Solutions Architect', avatarUrl: '' },
        tags: data.tags || [],
      };
    } catch (err) {
      console.error('Unexpected error getting blog by slug:', err);
      return null;
    }
  },

  async saveBlog(blog: Partial<BlogPost> & { title: string; slug: string; content: string }): Promise<boolean> {
    try {
      const id = blog.id || blog.slug;
      const dbPayload = {
        id,
        title: blog.title,
        slug: blog.slug,
        category: blog.category || 'Engineering',
        description: blog.description || '',
        content: blog.content,
        image_url: blog.imageUrl || '',
        read_time: blog.readTime || '5 min read',
        published_at: blog.publishedAt || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        author: blog.author || { name: 'GM Digital Studio', role: 'Solutions Architect', avatarUrl: '' },
        tags: blog.tags || [],
      };

      const { error } = await supabase.from('blogs').upsert(dbPayload);

      if (error) {
        console.error('Error saving blog:', error);
        return false;
      }

      window.dispatchEvent(new Event('gm_cms_updated'));
      return true;
    } catch (err) {
      console.error('Unexpected error saving blog:', err);
      return false;
    }
  },

  async deleteBlog(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('blogs').delete().eq('id', id);

      if (error) {
        console.error('Error deleting blog:', error);
        return false;
      }

      window.dispatchEvent(new Event('gm_cms_updated'));
      return true;
    } catch (err) {
      console.error('Unexpected error deleting blog:', err);
      return false;
    }
  },

  // ==================== PORTFOLIO CASE STUDIES ====================
  async getCaseStudies(): Promise<CaseStudy[]> {
    try {
      const { data, error } = await supabase
        .from('case_studies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching case studies:', error);
      }

      const dbStudies: CaseStudy[] = (data || []).map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        category: row.category,
        client: row.client,
        year: row.year,
        timeline: row.timeline,
        description: row.description,
        summary: row.summary,
        thumbnailUrl: row.thumbnail_url,
        heroImageUrl: row.hero_image_url,
        metrics: row.metrics || [],
        challenge: row.challenge,
        solution: row.solution,
        deliverables: row.deliverables || [],
        techStack: row.tech_stack || [],
        results: row.results || [],
        testimonial: row.testimonial || undefined,
      }));

      // Combine DB studies with default static studies (avoiding duplicate slugs)
      const existingSlugs = new Set(dbStudies.map((s) => s.slug));
      const missingStatic = CASE_STUDIES.filter((s) => !existingSlugs.has(s.slug));

      return [...dbStudies, ...missingStatic];
    } catch (err) {
      console.error('Unexpected error fetching case studies:', err);
      return CASE_STUDIES;
    }
  },

  async getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
    try {
      const { data, error } = await supabase
        .from('case_studies')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.warn('Case study not found in DB, using fallback if available:', slug);
      }

      if (data) {
        return {
          id: data.id,
          slug: data.slug,
          title: data.title,
          category: data.category,
          client: data.client,
          year: data.year,
          timeline: data.timeline,
          description: data.description,
          summary: data.summary,
          thumbnailUrl: data.thumbnail_url,
          heroImageUrl: data.hero_image_url,
          metrics: data.metrics || [],
          challenge: data.challenge,
          solution: data.solution,
          deliverables: data.deliverables || [],
          techStack: data.tech_stack || [],
          results: data.results || [],
          testimonial: data.testimonial || undefined,
        };
      }

      // Fallback to static case study if not yet in database
      const fallback = CASE_STUDIES.find((c) => c.slug === slug || c.id === slug);
      return fallback || null;
    } catch (err) {
      const fallback = CASE_STUDIES.find((c) => c.slug === slug || c.id === slug);
      return fallback || null;
    }
  },

  async saveCaseStudy(study: Partial<CaseStudy> & { title: string; slug: string; client: string }): Promise<boolean> {
    try {
      const id = study.id || study.slug;
      const dbPayload = {
        id,
        title: study.title,
        slug: study.slug,
        category: study.category || 'Web Development',
        client: study.client,
        year: study.year || new Date().getFullYear().toString(),
        timeline: study.timeline || '8 Weeks',
        description: study.description || '',
        summary: study.summary || '',
        thumbnail_url: study.thumbnailUrl || study.heroImageUrl || '',
        hero_image_url: study.heroImageUrl || study.thumbnailUrl || '',
        metrics: study.metrics || [],
        challenge: study.challenge || '',
        solution: study.solution || '',
        deliverables: study.deliverables || [],
        tech_stack: study.techStack || [],
        results: study.results || [],
        testimonial: study.testimonial || null,
      };

      const { error } = await supabase.from('case_studies').upsert(dbPayload);

      if (error) {
        console.error('Error saving case study:', error);
        return false;
      }

      window.dispatchEvent(new Event('gm_cms_updated'));
      return true;
    } catch (err) {
      console.error('Unexpected error saving case study:', err);
      return false;
    }
  },

  async deleteCaseStudy(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('case_studies').delete().eq('id', id);

      if (error) {
        console.error('Error deleting case study:', error);
        return false;
      }

      window.dispatchEvent(new Event('gm_cms_updated'));
      return true;
    } catch (err) {
      console.error('Unexpected error deleting case study:', err);
      return false;
    }
  },

  // ==================== BLOG COMMENTS ====================
  async getCommentsForBlog(blogId: string): Promise<BlogComment[]> {
    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('blog_id', blogId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async getAllComments(): Promise<BlogComment[]> {
    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async submitComment(blogId: string, name: string, email: string, content: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('blog_comments').insert({
        blog_id: blogId,
        name,
        email,
        content,
        status: 'pending',
      });

      if (error) {
        console.error('Error submitting comment:', error);
        return false;
      }

      window.dispatchEvent(new Event('gm_cms_updated'));
      return true;
    } catch (err) {
      console.error('Unexpected error submitting comment:', err);
      return false;
    }
  },

  async approveComment(commentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('blog_comments')
        .update({ status: 'approved' })
        .eq('id', commentId);

      if (error) return false;
      window.dispatchEvent(new Event('gm_cms_updated'));
      return true;
    } catch {
      return false;
    }
  },

  async deleteComment(commentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('blog_comments')
        .delete()
        .eq('id', commentId);

      if (error) return false;
      window.dispatchEvent(new Event('gm_cms_updated'));
      return true;
    } catch {
      return false;
    }
  },

  async replyToComment(commentId: string, replyText: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('blog_comments')
        .update({
          admin_reply: replyText,
          admin_reply_at: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) {
        console.error('Error replying to comment:', error);
        return false;
      }
      window.dispatchEvent(new Event('gm_cms_updated'));
      return true;
    } catch (err) {
      console.error('Unexpected error replying to comment:', err);
      return false;
    }
  },

  // ==================== AUTHORS MANAGEMENT ====================
  async getAuthors(): Promise<AuthorItem[]> {
    try {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('created_at', { ascending: true });

      if (error || !data || data.length === 0) {
        // Fallback default presets if DB table empty
        return [
          { id: '1', name: '', email: '', role: 'Studio Administrator', avatar_url: '' },
          { id: '2', name: 'Alex Morgan', email: 'alex@gmdigital.com', role: 'Principal Solutions Architect', avatar_url: '/src/assets/avatars/avatar-1.jpg' },
          { id: '3', name: 'Marcus Vance', email: 'marcus@gmdigital.com', role: 'Head of UI/UX Design', avatar_url: '/src/assets/avatars/avatar-2.jpg' },
          { id: '4', name: 'Sophia Chen', email: 'sophia@gmdigital.com', role: 'Lead Full-Stack Developer', avatar_url: '/src/assets/avatars/avatar-3.jpg' },
        ];
      }

      return data;
    } catch {
      return [
        { id: '1', name: '', email: '', role: 'Studio Administrator', avatar_url: '' },
      ];
    }
  },

  async saveAuthor(author: { id?: string; name: string; email?: string; role: string; avatar_url?: string; bio?: string; password?: string }): Promise<boolean> {
    try {
      const isNew = !author.id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(author.id);

      if (isNew) {
        if (!author.email || !author.password || author.password.length < 6) {
          alert('Email and a password of at least 6 characters are required for new authors.');
          return false;
        }

        const { data, error } = await supabase.functions.invoke('manage-users', {
          body: {
            action: 'create-user',
            email: author.email,
            password: author.password,
            role: 'author',
            updates: {
              name: author.name,
              role: author.role || 'Author',
              avatar_url: author.avatar_url || '',
              bio: author.bio || '',
            }
          }
        });

        if (error || data?.error) {
          console.error('Error creating author via Edge Function:', error || data?.error);
          let errorMsg = 'Failed to create author.';
          if (error) {
            try {
              const errBody = await (error as any).context.json();
              errorMsg = errBody.error || error.message;
            } catch {
              errorMsg = error.message;
            }
          } else if (data?.error) {
            errorMsg = data.error;
          }
          alert(errorMsg);
          return false;
        }
      } else {
        const { data, error } = await supabase.functions.invoke('manage-users', {
          body: {
            action: 'update-user',
            userId: author.id,
            email: author.email,
            password: author.password || undefined,
            role: 'author',
            updates: {
              name: author.name,
              role: author.role,
              avatar_url: author.avatar_url,
              bio: author.bio,
            }
          }
        });

        if (error || data?.error) {
          console.error('Error updating author via Edge Function:', error || data?.error);
          let errorMsg = 'Failed to update author.';
          if (error) {
            try {
              const errBody = await (error as any).context.json();
              errorMsg = errBody.error || error.message;
            } catch {
              errorMsg = error.message;
            }
          } else if (data?.error) {
            errorMsg = data.error;
          }
          alert(errorMsg);
          return false;
        }
      }

      window.dispatchEvent(new Event('gm_cms_updated'));
      return true;
    } catch (err) {
      console.error('Unexpected error saving author:', err);
      return false;
    }
  },

  async deleteAuthor(id: string): Promise<boolean> {
    try {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        const { data, error } = await supabase.functions.invoke('manage-users', {
          body: {
            action: 'delete-user',
            userId: id,
            role: 'author'
          }
        });

        if (error || data?.error) {
          console.error('Error deleting author:', error || data?.error);
          return false;
        }
      } else {
        // Preset default fallback authors not in DB Auth
        const { error } = await supabase.from('authors').delete().eq('id', id);
        if (error) return false;
      }
      
      window.dispatchEvent(new Event('gm_cms_updated'));
      return true;
    } catch {
      return false;
    }
  },

  async uploadAuthorAvatar(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error } = await supabase.storage.from('invoices').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

      if (error) {
        console.error('Avatar upload error:', error);
        return null;
      }

      const { data } = supabase.storage.from('invoices').getPublicUrl(filePath);
      return data?.publicUrl || null;
    } catch (err) {
      console.error('Unexpected error uploading avatar:', err);
      return null;
    }
  },
};
