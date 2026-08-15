import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://gmdigitalstudio.app';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

const staticRoutes = [
  { url: '/', changefreq: 'weekly', priority: '1.0' },
  { url: '/services', changefreq: 'weekly', priority: '0.9' },
  { url: '/portfolio', changefreq: 'weekly', priority: '0.9' },
  { url: '/about', changefreq: 'monthly', priority: '0.8' },
  { url: '/pricing', changefreq: 'weekly', priority: '0.8' },
  { url: '/blog', changefreq: 'daily', priority: '0.8' },
  { url: '/contact', changefreq: 'monthly', priority: '0.8' },
  { url: '/faq', changefreq: 'monthly', priority: '0.7' },
  { url: '/privacy-policy', changefreq: 'yearly', priority: '0.4' },
  { url: '/terms', changefreq: 'yearly', priority: '0.4' },
];

async function generateSitemap() {
  const dynamicRoutes = [];
  const today = new Date().toISOString().split('T')[0];

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      // Fetch published blog posts
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('slug, id, updated_at, created_at, published')
        .eq('published', true);

      if (posts) {
        posts.forEach((p) => {
          const identifier = p.slug || p.id;
          const date = (p.updated_at || p.created_at || today).split('T')[0];
          dynamicRoutes.push({
            url: `/blog/${identifier}`,
            lastmod: date,
            changefreq: 'weekly',
            priority: '0.7',
          });
        });
      }

      // Fetch published portfolio projects / case studies
      const { data: portfolio } = await supabase
        .from('portfolio_projects')
        .select('slug, id, updated_at, created_at')
        .limit(100);

      if (portfolio) {
        portfolio.forEach((proj) => {
          const identifier = proj.slug || proj.id;
          const date = (proj.updated_at || proj.created_at || today).split('T')[0];
          dynamicRoutes.push({
            url: `/portfolio/${identifier}`,
            lastmod: date,
            changefreq: 'monthly',
            priority: '0.7',
          });
        });
      }
    } catch (err) {
      console.warn('Could not fetch dynamic routes from Supabase, using static routes:', err.message);
    }
  }

  const allUrls = [
    ...staticRoutes.map((r) => `  <url>
    <loc>${BASE_URL}${r.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`),
    ...dynamicRoutes.map((r) => `  <url>
    <loc>${BASE_URL}${r.url}</loc>
    <lastmod>${r.lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`),
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

${allUrls.join('\n\n')}

</urlset>
`;

  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log(`✓ Generated sitemap.xml with ${allUrls.length} total URLs.`);
}

generateSitemap();
