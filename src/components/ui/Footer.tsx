import { Link } from 'react-router-dom';
import logo from '../../assets/icon-logo.png';

const Footer = () => {
  return (
    <footer className="border-t border-gray-200/80 bg-gray-900 text-white dark:border-dark-border dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logo} alt="GM Digital Studio Logo" className="h-8 w-auto object-contain" />
              <span className="text-xl font-heading font-bold text-white">
                GM Digital <span className="text-brand-500">Studio</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400">
              Empowering digital experiences with modern web applications and design solutions.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Services</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/services" className="hover:text-brand-400 transition-colors">Web Development</Link></li>
              <li><Link to="/services" className="hover:text-brand-400 transition-colors">UI/UX Design</Link></li>
              <li><Link to="/services" className="hover:text-brand-400 transition-colors">SEO Optimization</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-brand-400 transition-colors">About Us</Link></li>
              <li><Link to="/services" className="hover:text-brand-400 transition-colors">Services</Link></li>
              <li><Link to="/contact" className="hover:text-brand-400 transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/privacy" className="hover:text-brand-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-brand-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} GM Digital Studio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
