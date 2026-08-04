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

        if (settings?.faviconUrl) {
          const favUrl = settings.faviconUrl;
          const baseFolder = favUrl.substring(0, favUrl.lastIndexOf('/'));
          
          const iconConfigs = [
            { rel: 'icon', type: 'image/x-icon', href: `${baseFolder}/favicon.ico`, query: "link[rel='icon']:not([sizes])" },
            { rel: 'icon', type: 'image/png', sizes: '32x32', href: `${baseFolder}/favicon-32x32.png`, query: "link[sizes='32x32']" },
            { rel: 'icon', type: 'image/png', sizes: '16x16', href: `${baseFolder}/favicon-16x16.png`, query: "link[sizes='16x16']" },
            { rel: 'apple-touch-icon', sizes: '180x180', href: `${baseFolder}/apple-touch-icon.png`, query: "link[rel='apple-touch-icon']" }
          ];

          const cacheBust = `?t=${Date.now()}`;
          iconConfigs.forEach((cfg) => {
            let tag = document.querySelector(cfg.query) as HTMLLinkElement;
            if (!tag) {
              tag = document.createElement('link');
              tag.rel = cfg.rel;
              if (cfg.sizes) tag.setAttribute('sizes', cfg.sizes);
              document.head.appendChild(tag);
            }
            if (cfg.type) {
              tag.type = cfg.type;
            } else {
              tag.removeAttribute('type');
            }
            tag.href = `${cfg.href}${cacheBust}`;
          });
        }
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
