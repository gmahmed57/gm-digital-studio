import React, { useEffect } from 'react';
import { settingsService } from '../../services/settingsService';

interface SEOProps {
  title: string;
  description: string;
}

const SEO: React.FC<SEOProps> = ({ title, description }) => {
  useEffect(() => {
    // 1. Update meta description tag
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // 2. Fetch settings for dynamic title brand and favicons
    const applyBranding = async () => {
      try {
        const settings = await settingsService.getSettings();
        const brandName = settings?.siteName || 'GM DIGITAL STUDIO';
        document.title = `${title} | ${brandName}`;

        const isStaleStorageFavicon = settings?.faviconUrl?.includes('favicon_favicon-32x32.png');
        const favUrl = (settings?.faviconUrl && !isStaleStorageFavicon) ? settings.faviconUrl : '/pwa-192.png';
        const cacheBustUrl = favUrl.includes('?') ? favUrl : `${favUrl}?t=${Date.now()}`;
        
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
