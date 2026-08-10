import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { searchService, type SearchResultItem } from '../../services/searchService';
import { 
  Search, 
  X, 
  Layers, 
  Users, 
  CreditCard, 
  FileText, 
  Wrench, 
  ArrowRight, 
  Command,
  Loader2
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      const data = await searchService.searchAll(query, role || undefined, user?.email);
      setResults(data);
      setSelectedIndex(0);
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, role, user]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        const selected = results[selectedIndex];
        if (selected) {
          handleItemClick(selected.link);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const handleItemClick = (link: string) => {
    onClose();
    navigate(link);
  };

  const getSearchInfo = () => {
    if (role === 'admin') {
      return {
        placeholder: 'Search projects, invoices, clients, tools...',
        emptyText: 'Search studio projects, client accounts, invoices & tools.',
      };
    }
    if (role === 'author') {
      return {
        placeholder: 'Search blog posts & articles...',
        emptyText: 'Search published articles and draft CMS content.',
      };
    }
    return {
      placeholder: 'Search your projects, invoices & tools...',
      emptyText: 'Search your assigned projects, invoices and unlocked tools.',
    };
  };

  const searchInfo = getSearchInfo();

  if (!isOpen) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'projects':
        return <Layers className="w-4 h-4 text-blue-500" />;
      case 'clients':
        return <Users className="w-4 h-4 text-emerald-500" />;
      case 'invoices':
        return <CreditCard className="w-4 h-4 text-brand-500" />;
      case 'blogs':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'tools':
        return <Wrench className="w-4 h-4 text-amber-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20 md:pt-28 px-4 bg-gray-950/70 backdrop-blur-md transition-opacity font-sans"
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] transition-all transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-dark-border flex items-center gap-3 bg-gray-50/50 dark:bg-dark-surface/50">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchInfo.placeholder}
            className="w-full bg-transparent text-sm md:text-base font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-brand-500 animate-spin shrink-0" />}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results Area */}
        <div className="flex-1 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              <Command className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p className="font-semibold text-gray-700 dark:text-gray-300">Type a search term</p>
              <p className="text-[11px] mt-1">{searchInfo.emptyText}</p>
            </div>
          ) : loading && results.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              Searching studio database...
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              No matching records found for "{query}".
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item.link)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-brand-500/10 dark:bg-brand-500/20 border border-brand-500/30'
                        : 'hover:bg-gray-50 dark:hover:bg-dark-surface border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-dark-surface">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white leading-tight">
                            {item.title}
                          </h4>
                          {item.badge && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-300">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-1 text-brand-500' : 'text-gray-300 dark:text-gray-600'}`} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer Controls Info */}
        <div className="p-3 border-t border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 text-[11px] text-gray-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-dark-border text-gray-700 dark:text-gray-300 font-mono text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-dark-border text-gray-700 dark:text-gray-300 font-mono text-[10px]">↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-dark-border text-gray-700 dark:text-gray-300 font-mono text-[10px]">↵</kbd> Select</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-dark-border text-gray-700 dark:text-gray-300 font-mono text-[10px]">ESC</kbd> Close</span>
          </div>
          <span className="hidden sm:inline text-brand-500 font-semibold">GM Studio Search</span>
        </div>

      </div>
    </div>
  );
}
