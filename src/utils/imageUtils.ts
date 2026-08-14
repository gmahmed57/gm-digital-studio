/**
 * Utility to resolve, sanitize, and fallback image asset URLs across GM Digital Studio.
 * Handles local assets, Unsplash CDN URLs, Supabase Storage URLs, relative paths, and broken links.
 */

// Curated unique high-res Unsplash blog covers for distinct card visual identity
const BLOG_COVER_FALLBACKS = [
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80',
];

// Curated unique high-res Unsplash project / case study covers matching different agency verticals
const PROJECT_COVER_FALLBACKS = [
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80', // SaaS Telemetry & Analytics
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80', // Brand Identity & Vector System
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80', // AI Automation & Workflow
  'https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=800&auto=format&fit=crop&q=80', // Mobile Health & Biometrics
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80', // Web Engineering & Next.js
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80', // Cloud Infrastructure & DevOps
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80', // Real-Time Dashboard
  'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800&auto=format&fit=crop&q=80', // Tokenized Figma Design System
];

// Curated professional avatars
const AVATAR_FALLBACKS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
];

/**
 * Generate a deterministic hash index from a key string
 */
function hashString(key: string, listLength: number): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % listLength;
}

export function getFallbackUrl(
  fallbackType: 'avatar' | 'blog' | 'project' = 'avatar',
  key?: string
): string {
  const seedKey = key && key.trim() ? key.trim() : 'default-seed';

  if (fallbackType === 'blog') {
    return BLOG_COVER_FALLBACKS[hashString(seedKey, BLOG_COVER_FALLBACKS.length)];
  }

  if (fallbackType === 'project') {
    return PROJECT_COVER_FALLBACKS[hashString(seedKey, PROJECT_COVER_FALLBACKS.length)];
  }

  return AVATAR_FALLBACKS[hashString(seedKey, AVATAR_FALLBACKS.length)];
}

export function resolveAssetUrl(
  rawUrl: string | null | undefined,
  fallbackType: 'avatar' | 'blog' | 'project' = 'avatar',
  key?: string
): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return getFallbackUrl(fallbackType, key);
  }

  const cleanUrl = rawUrl.trim();
  if (!cleanUrl || cleanUrl === 'undefined' || cleanUrl === 'null') {
    return getFallbackUrl(fallbackType, key);
  }

  // Absolute URLs, Supabase Storage URLs, Data URIs, Blob URLs are passed directly
  if (
    cleanUrl.startsWith('http://') ||
    cleanUrl.startsWith('https://') ||
    cleanUrl.startsWith('data:') ||
    cleanUrl.startsWith('blob:')
  ) {
    return cleanUrl;
  }

  // Local asset references (e.g. src/assets/..., assets/..., public/...) that don't exist as static files on Vercel
  // are automatically converted to distinct, high-res Unsplash fallbacks
  return getFallbackUrl(fallbackType, key);
}

/**
 * Handle image load errors gracefully by switching to a deterministic fallback URL
 */
export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackType: 'avatar' | 'blog' | 'project' = 'avatar',
  key?: string
) {
  const target = e.currentTarget;
  const fallback = getFallbackUrl(fallbackType, key);
  if (target.src !== fallback) {
    target.src = fallback;
  }
}
