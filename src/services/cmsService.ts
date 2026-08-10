import { supabase } from './supabase';
import type { BlogPost, CaseStudy } from '../types/portfolio';
import { CASE_STUDIES } from '../constants/portfolioData';
import { TESTIMONIALS } from '../constants/homeData';

export interface AuthorItem {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatarUrl: string;
  displayOrder?: number;
  createdAt?: string;
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

      // Fetch real-time authors and profiles for live avatar joining
      const { data: dbAuthors } = await supabase.from('authors').select('*');
      const { data: dbProfiles } = await supabase.from('profiles').select('*');

      return (data || []).map((row) => {
        const rawAuthor = row.author || {};
        const authorName = rawAuthor.name || rawAuthor.fullName || '';
        
        const matchAuthor = dbAuthors?.find(a => (a.name && authorName && a.name.toLowerCase() === authorName.toLowerCase()) || (a.email && rawAuthor.email && a.email.toLowerCase() === rawAuthor.email.toLowerCase()));
        const matchProfile = dbProfiles?.find(p => (p.fullName && authorName && p.fullName.toLowerCase() === authorName.toLowerCase()) || (p.email && rawAuthor.email && p.email.toLowerCase() === rawAuthor.email.toLowerCase()));

        const finalAvatarUrl = matchAuthor?.avatar_url || matchProfile?.avatar_url || rawAuthor.avatarUrl || rawAuthor.avatar_url || '';

        return {
          id: row.id,
          slug: row.slug,
          title: row.title,
          category: row.category,
          description: row.description,
          content: row.content,
          imageUrl: row.image_url,
          readTime: row.read_time,
          publishedAt: row.published_at,
          author: {
            name: authorName || matchAuthor?.name || matchProfile?.fullName || '',
            role: matchAuthor?.role || matchProfile?.job_title || rawAuthor.role || '',
            avatarUrl: finalAvatarUrl,
          },
          tags: row.tags || [],
        };
      });
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

      const { data: dbAuthors } = await supabase.from('authors').select('*');
      const { data: dbProfiles } = await supabase.from('profiles').select('*');

      const rawAuthor = data.author || {};
      const authorName = rawAuthor.name || rawAuthor.fullName || '';

      const matchAuthor = dbAuthors?.find(a => (a.name && authorName && a.name.toLowerCase() === authorName.toLowerCase()) || (a.email && rawAuthor.email && a.email.toLowerCase() === rawAuthor.email.toLowerCase()));
      const matchProfile = dbProfiles?.find(p => (p.fullName && authorName && p.fullName.toLowerCase() === authorName.toLowerCase()) || (p.email && rawAuthor.email && p.email.toLowerCase() === rawAuthor.email.toLowerCase()));

      const finalAvatarUrl = matchAuthor?.avatar_url || matchProfile?.avatar_url || rawAuthor.avatarUrl || rawAuthor.avatar_url || '';

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
        author: {
          name: authorName || matchAuthor?.name || matchProfile?.fullName || '',
          role: matchAuthor?.role || matchProfile?.job_title || rawAuthor.role || '',
          avatarUrl: finalAvatarUrl,
        },
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

      window.dispatchEvent(new Event('studio_cms_updated'));
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

      window.dispatchEvent(new Event('studio_cms_updated'));
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

      window.dispatchEvent(new Event('studio_cms_updated'));
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

      window.dispatchEvent(new Event('studio_cms_updated'));
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

      window.dispatchEvent(new Event('studio_cms_updated'));
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
      window.dispatchEvent(new Event('studio_cms_updated'));
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
      window.dispatchEvent(new Event('studio_cms_updated'));
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
      window.dispatchEvent(new Event('studio_cms_updated'));
      return true;
    } catch (err) {
      console.error('Unexpected error replying to comment:', err);
      return false;
    }
  },

  async getAuthors(): Promise<AuthorItem[]> {
    try {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('created_at', { ascending: true });

      if (error || !data) {
        console.error('Supabase select authors error:', error?.message);
        return [];
      }

      return data;
    } catch (err) {
      console.error('Unexpected error fetching authors:', err);
      return [];
    }
  },

  async saveAuthor(author: { id?: string; name: string; email?: string; role: string; avatar_url?: string; bio?: string; password?: string }): Promise<boolean> {
    try {
      const authorId = author.id || `author-${Date.now()}`;
      
      // 1. Direct DB Table Upsert into public.authors for instant persistence
      const dbAuthorPayload = {
        id: authorId,
        name: author.name,
        email: author.email || '',
        role: author.role || 'Author',
        avatar_url: author.avatar_url || '',
        bio: author.bio || '',
      };

      try {
        await supabase.from('authors').upsert(dbAuthorPayload);
      } catch (dbErr) {
        console.warn('Authors table upsert notice:', dbErr);
      }

      // 2. Update public.profiles only if a matching row exists (CMS authors may not have platform accounts)
      if (author.email) {
        const cleanEmail = author.email.trim().toLowerCase();
        try {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', cleanEmail)
            .maybeSingle();

          if (existingProfile) {
            await supabase.from('profiles').update({
              fullName: author.name,
              job_title: author.role,
              avatar_url: author.avatar_url || '',
              bio: author.bio || '',
            }).eq('email', cleanEmail);
          }
        } catch (profErr) {
          console.warn('Profiles update notice:', profErr);
        }
      }

      // 3. Optional Edge Function sync attempt (never blocks UI if user is admin or not found in Auth)
      if (author.email && author.password && author.password.length >= 6) {
        try {
          const isUuid = author.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(author.id);
          await supabase.functions.invoke('manage-users', {
            body: {
              action: isUuid ? 'update-user' : 'create-user',
              userId: isUuid ? author.id : undefined,
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
        } catch (efErr) {
          console.warn('Edge Function auth sync notice:', efErr);
        }
      }

      window.dispatchEvent(new Event('studio_cms_updated'));
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
      
      window.dispatchEvent(new Event('studio_cms_updated'));
      return true;
    } catch {
      return false;
    }
  },

  async uploadAuthorAvatar(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `author-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage.from('avatars').upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

      if (error) {
        console.error('Avatar upload error:', error);
        throw error;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      return data?.publicUrl || null;
    } catch (err) {
      console.error('Unexpected error uploading avatar:', err);
      return null;
    }
  },

  // ==================== TESTIMONIALS ====================
  async getTestimonials(): Promise<TestimonialItem[]> {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((row) => ({
          id: row.id,
          name: row.name,
          role: row.role || '',
          company: row.company || '',
          content: row.content,
          rating: row.rating || 5,
          avatarUrl: row.avatar_url || '',
          displayOrder: row.display_order || 0,
          createdAt: row.created_at,
        }));
      }
    } catch (err) {
      console.warn('[CMS Service] Testimonials fetch notice:', err);
    }
    // Fallback to initial seed array
    return TESTIMONIALS.map((item, idx) => ({
      ...item,
      displayOrder: idx,
    }));
  },

  async saveTestimonial(item: Partial<TestimonialItem>): Promise<boolean> {
    try {
      const id = item.id || `testi-${Date.now()}`;
      const payload = {
        id,
        name: item.name,
        role: item.role || '',
        company: item.company || '',
        content: item.content,
        rating: item.rating || 5,
        avatar_url: item.avatarUrl || '',
        display_order: item.displayOrder || 0,
      };

      const { error } = await supabase.from('testimonials').upsert(payload);
      if (error) {
        console.error('Error saving testimonial:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Unexpected error saving testimonial:', err);
      return false;
    }
  },

  async deleteTestimonial(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) {
        console.error('Error deleting testimonial:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Unexpected error deleting testimonial:', err);
      return false;
    }
  },

  async uploadTestimonialAvatar(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `testimonial-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage.from('testimonial-avatars').upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

      if (error) {
        console.error('Testimonial avatar upload error:', error);
        throw error;
      }

      const { data } = supabase.storage.from('testimonial-avatars').getPublicUrl(fileName);
      return data?.publicUrl || null;
    } catch (err) {
      console.error('Unexpected error uploading testimonial avatar:', err);
      return null;
    }
  },
};
