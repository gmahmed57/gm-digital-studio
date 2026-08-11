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
            const cacheBustUrl = favUrl.includes('?') ? favUrl : `${favUrl}?t=${Date.now()}`;
            
            document.querySelectorAll("link[rel*='icon']").forEach((el) => el.remove());

            const newLink = document.createElement('link');
            newLink.id = 'app-favicon';
            newLink.rel = 'icon';
            if (favUrl.endsWith('.png')) {
              newLink.type = 'image/png';
            } else if (favUrl.endsWith('.svg')) {
              newLink.type = 'image/svg+xml';
            } else if (favUrl.endsWith('.webp')) {
              newLink.type = 'image/webp';
            } else {
              newLink.type = 'image/x-icon';
            }
            newLink.href = cacheBustUrl;
            document.head.appendChild(newLink);
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
