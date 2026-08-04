import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import { ThemeProvider } from '../context/ThemeContext';
import { settingsService } from '../services/settingsService';

const RootLayout = () => {
  useEffect(() => {
    const applyGlobalBranding = async () => {
      try {
        const settings = await settingsService.getSettings();
        if (settings) {
          // Dynamic Tab Title
          const brandName = settings.siteName || 'GM DIGITAL STUDIO';
          if (!document.title.includes(brandName)) {
            document.title = `${document.title.split(' | ')[0]} | ${brandName}`;
          }

          // Dynamic Tab Favicons
          if (settings.faviconUrl) {
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
        }
      } catch (e) {
        console.error('Root layout global settings load failed', e);
      }
    };

    applyGlobalBranding();
  }, []);

  return (
    <ThemeProvider defaultTheme="system" storageKey="gm-theme">
      <div className="flex min-h-screen flex-col bg-white text-gray-900 transition-colors duration-300 dark:bg-dark-bg dark:text-white font-sans">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default RootLayout;
