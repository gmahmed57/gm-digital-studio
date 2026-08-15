import React, { useEffect } from 'react';
import { settingsService } from '../../services/settingsService';
import { isPortalHostname } from '../../utils/domainUtils';

interface SEOProps {
  title: string;
  description: string;
  noIndex?: boolean;
}

const SEO: React.FC<SEOProps> = ({ title, description, noIndex }) => {
  useEffect(() => {
    // 1. Update meta description tag
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // 2. Manage robots index/noindex (Portal and private pages are strictly 100% noindex, nofollow)
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    const isPrivatePath = typeof window !== 'undefined' && (
      window.location.pathname.startsWith('/admin') ||
      window.location.pathname.startsWith('/client') ||
      window.location.pathname.startsWith('/author') ||
      window.location.pathname.startsWith('/login') ||
      window.location.pathname.startsWith('/forgot-password')
    );
    const shouldNoIndex = noIndex || isPortalHostname() || isPrivatePath;
    metaRobots.setAttribute('content', shouldNoIndex ? 'noindex, nofollow' : 'index, follow');

    // 2. Fetch settings for dynamic title brand and favicons
    const applyBranding = async () => {
      try {
        const settings = await settingsService.getSettings();
        const brandName = settings?.siteName || 'GM DIGITAL STUDIO';
        document.title = `${title} | ${brandName}`;

        const isStaleStorageFavicon = settings?.faviconUrl?.includes('favicon_favicon-32x32.png');
        const favUrl = (settings?.faviconUrl && !isStaleStorageFavicon) ? settings.faviconUrl : '/pwa-192.png';
        const cacheBustUrl = favUrl.startsWith('http') ? (favUrl.includes('?') ? favUrl : `${favUrl}?t=${Date.now()}`) : favUrl;
        
        let favLink = document.getElementById('app-favicon') as HTMLLinkElement | null;
        if (!favLink) {
          favLink = document.createElement('link');
          favLink.id = 'app-favicon';
          favLink.rel = 'icon';
          document.head.appendChild(favLink);
        }

        if (favUrl.endsWith('.png') || favUrl.includes('pwa-192')) {
          favLink.type = 'image/png';
        } else if (favUrl.endsWith('.svg')) {
          favLink.type = 'image/svg+xml';
        } else if (favUrl.endsWith('.webp')) {
          favLink.type = 'image/webp';
        } else {
          favLink.type = 'image/x-icon';
        }
        favLink.href = cacheBustUrl;
      } catch (e) {
        console.error('SEO settings load failed', e);
        document.title = `${title} | GM DIGITAL STUDIO`;
      }
    };

    applyBranding();
  }, [title, description]);

  return null;
};

export default SEO;
