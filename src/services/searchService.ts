import { projectService } from './projectService';
import { clientService } from './clientService';
import { invoiceService } from './invoiceService';
import { cmsService } from './cmsService';

export type SearchCategory = 'projects' | 'clients' | 'invoices' | 'blogs' | 'tools';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: SearchCategory;
  categoryLabel: string;
  link: string;
  badge?: string;
  badgeColor?: string;
}

export const searchService = {
  /**
   * Search across all studio platform resources
   */
  async searchAll(query: string, userRole?: string, userEmail?: string): Promise<SearchResultItem[]> {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return [];

    const results: SearchResultItem[] = [];

    try {
      // 1. Search Projects
      try {
        const projects = await projectService.getProjects();
        const matchedProjects = projects.filter((p) => {
          if (userRole === 'client' && userEmail && p.clientEmail.toLowerCase() !== userEmail.toLowerCase()) {
            return false;
          }
          return (
            p.title.toLowerCase().includes(cleanQuery) ||
            p.description.toLowerCase().includes(cleanQuery) ||
            p.clientName.toLowerCase().includes(cleanQuery) ||
            p.category.toLowerCase().includes(cleanQuery)
          );
        });

        matchedProjects.forEach((p) => {
          results.push({
            id: `proj-${p.id}`,
            title: p.title,
            subtitle: `${p.clientName} • ${p.category} (${p.progress}%)`,
            category: 'projects',
            categoryLabel: 'Project',
            link: userRole === 'admin' ? `/admin/projects` : `/client/projects`,
            badge: p.status,
            badgeColor: p.status === 'completed' ? 'green' : 'blue'
          });
        });
      } catch {
        // Silent search fallback
      }

      // 2. Search Clients (Admin Only)
      if (userRole === 'admin') {
        try {
          const clients = await clientService.getClients();
          const matchedClients = clients.filter((c) =>
            c.fullName.toLowerCase().includes(cleanQuery) ||
            c.company.toLowerCase().includes(cleanQuery) ||
            c.email.toLowerCase().includes(cleanQuery)
          );

          matchedClients.forEach((c) => {
            results.push({
              id: `client-${c.id}`,
              title: c.fullName,
              subtitle: `${c.company} • ${c.email}`,
              category: 'clients',
              categoryLabel: 'Client',
              link: `/admin/clients`,
              badge: c.status,
              badgeColor: c.status === 'active' ? 'green' : 'gray'
            });
          });
        } catch {
          // Silent catch
        }
      }

      // 3. Search Invoices
      try {
        const invoices = await invoiceService.getInvoices();
        const matchedInvoices = invoices.filter((inv) => {
          if (userRole === 'client' && userEmail && inv.clientEmail.toLowerCase() !== userEmail.toLowerCase()) {
            return false;
          }
          return (
            inv.invoiceNumber.toLowerCase().includes(cleanQuery) ||
            inv.clientName.toLowerCase().includes(cleanQuery) ||
            inv.description.toLowerCase().includes(cleanQuery) ||
            inv.amount.toLowerCase().includes(cleanQuery)
          );
        });

        matchedInvoices.forEach((inv) => {
          results.push({
            id: `inv-${inv.id}`,
            title: `Invoice ${inv.invoiceNumber}`,
            subtitle: `${inv.clientName} • ${inv.amount} (${inv.description})`,
            category: 'invoices',
            categoryLabel: 'Invoice',
            link: userRole === 'admin' ? `/admin/invoices` : `/client/invoices`,
            badge: inv.status,
            badgeColor: inv.status === 'Paid' ? 'green' : inv.status === 'Overdue' ? 'red' : 'amber'
          });
        });
      } catch {
        // Silent catch
      }

      // 4. Search CMS Blogs & Case Studies (Admin & Author only)
      if (userRole === 'admin' || userRole === 'author') {
        try {
          const blogs = await cmsService.getBlogs();
          const matchedBlogs = blogs.filter((b) =>
            b.title.toLowerCase().includes(cleanQuery) ||
            b.category.toLowerCase().includes(cleanQuery) ||
            (b.description && b.description.toLowerCase().includes(cleanQuery))
          );

          matchedBlogs.forEach((b) => {
            results.push({
              id: `blog-${b.id}`,
              title: b.title,
              subtitle: `Blog Post • ${b.category} (${b.readTime})`,
              category: 'blogs',
              categoryLabel: 'Blog CMS',
              link: userRole === 'author' ? `/author/cms` : `/admin/cms`,
              badge: 'Published',
              badgeColor: 'purple'
            });
          });
        } catch {
          // Silent catch
        }
      }

      // 5. Search Studio Tools
      try {
        const catalog = [
          { id: 'carousel-maker', name: 'AI Carousel Post Maker', category: 'Social Media', desc: 'Generate multi-slide social carousels' },
          { id: 'seo-auditor', name: 'SEO & Performance Auditor', category: 'SEO', desc: 'Scan sites for SEO scores and page speed' },
          { id: 'ai-copywriter', name: 'AI Studio Copywriter', category: 'Content', desc: 'Generate high-converting agency marketing copy' },
          { id: 'file-converter', name: 'Media & File Converter', category: 'Utilities', desc: 'Base64 image encoding and JSON-YAML parser' },
          { id: 'brand-kit', name: 'Brand Kit & Style Generator', category: 'Branding', desc: 'Export custom typography and CSS design tokens' },
        ];

        const matchedTools = catalog.filter((t) =>
          t.name.toLowerCase().includes(cleanQuery) ||
          t.category.toLowerCase().includes(cleanQuery) ||
          t.desc.toLowerCase().includes(cleanQuery)
        );

        matchedTools.forEach((t) => {
          results.push({
            id: `tool-${t.id}`,
            title: t.name,
            subtitle: `Studio Tool • ${t.category}`,
            category: 'tools',
            categoryLabel: 'Studio Tool',
            link: userRole === 'admin' ? `/admin/settings` : `/client/tools`,
            badge: 'Tool',
            badgeColor: 'amber'
          });
        });
      } catch {
        // Silent catch
      }

    } catch {
      // Silent catch
    }

    return results;
  }
};
