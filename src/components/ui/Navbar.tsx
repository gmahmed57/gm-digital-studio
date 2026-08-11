import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, Menu, X, User } from 'lucide-react';
import logo from '../../assets/icon-logo.png';
import { settingsService } from '../../services/settingsService';

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [siteName, setSiteName] = useState('GM DIGITAL STUDIO');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoDisplayMode, setLogoDisplayMode] = useState<'logo-and-name' | 'logo-only'>('logo-and-name');

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await settingsService.getSettings();
      if (data) {
        if (data.siteName) setSiteName(data.siteName);
        if (data.logoUrl) setLogoUrl(data.logoUrl);
        if (data.logoDisplayMode) setLogoDisplayMode(data.logoDisplayMode);
      }
    };
    fetchSettings();
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-dark-border dark:bg-dark-bg/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
            <img src={logoUrl || logo} alt="Logo" className="h-8 w-auto object-contain flex-shrink-0" />
            {logoDisplayMode === 'logo-and-name' && (
              <span className="text-sm sm:text-base lg:text-lg font-heading font-extrabold text-gray-900 dark:text-white flex items-center tracking-tight whitespace-nowrap">
                {(() => {
                  const words = siteName.split(' ');
                  if (words.length <= 1) return siteName;
                  return (
                    <>
                      <span className="whitespace-nowrap">{words.slice(0, -1).join(' ')}</span>
                      <span className="ml-1.5 text-brand-500 dark:text-brand-400 whitespace-nowrap">
                        {words[words.length - 1]}
                      </span>
                    </>
                  );
                })()}
              </span>
            )}
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-3 xl:gap-6 flex-shrink-0">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `text-xs xl:text-sm font-medium transition-colors hover:text-brand-600 whitespace-nowrap ${isActive ? 'text-brand-600 font-semibold' : 'text-gray-600 dark:text-gray-300'}`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
          </button>

          <Link
            to="/login"
            className="hidden lg:inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-surface px-3 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap flex-shrink-0"
          >
            <User className="w-3.5 h-3.5 text-brand-600" /> Client Portal
          </Link>

          <Link
            to="/contact"
            className="hidden xl:inline-flex h-9 items-center justify-center rounded-md bg-brand-600 px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition-colors whitespace-nowrap flex-shrink-0"
          >
            Get Started
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-base font-medium ${
                    isActive
                      ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            <div className="pt-2 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-surface px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-200"
              >
                <User className="w-4 h-4 text-brand-600" /> Client Portal
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-brand-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
