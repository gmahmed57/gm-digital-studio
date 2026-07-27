import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, Menu, X, User } from 'lucide-react';
import logo from '../../assets/icon-logo.png';

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="GM Digital Studio Logo" className="h-8 w-auto object-contain" />
            <span className="text-xl font-heading font-bold text-gray-900 dark:text-white hidden sm:block">
              GM Digital <span className="text-brand-600">Studio</span>
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-brand-600 ${isActive ? 'text-brand-600' : 'text-gray-600 dark:text-gray-300'}`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
          </button>

          <Link
            to="/login"
            className="hidden md:inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-surface px-3.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-brand-600" /> Client Portal
          </Link>

          <Link
            to="/contact"
            className="hidden md:inline-flex h-9 items-center justify-center rounded-md bg-brand-600 px-4 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition-colors"
          >
            Get Started
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-base font-medium ${
                    isActive
                      ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'
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
