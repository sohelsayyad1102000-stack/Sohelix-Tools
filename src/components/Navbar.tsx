import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Moon, Sun, Menu, X, ChevronDown } from 'lucide-react';
import { TOOLS } from '../constants/tools';
import { CATEGORY_INFO } from '../constants/categories';
import { cn } from '../lib/utils';
import { Logo } from './Logo';

const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Blog', path: '/blog' },
];

// Helper to get dynamic categories
const getCategories = () => {
  const categoriesSet = new Set(TOOLS.map(tool => tool.category));
  return Array.from(categoriesSet)
    .map(slug => ({
      slug,
      name: CATEGORY_INFO[slug]?.title.replace('Free ', '').replace(' Online', '') || slug.replace('-', ' '),
      path: `/categories/${slug}`
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const Navbar: React.FC = () => {
  const categories = getCategories();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const filteredTools = TOOLS.filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200/50 bg-white/70 backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-950/70 transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
          <Logo />
        </Link>

        {/* Desktop Nav Links */}
        <nav aria-label="Desktop Navigation" className="hidden lg:flex items-center gap-1 ml-8 flex-1">
          <Link 
            to="/" 
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all active:scale-95"
          >
            Home
          </Link>
          <div className="relative group">
            <button className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all active:scale-95">
              Categories <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
            </button>
            <div className="absolute left-0 top-full mt-2 w-[480px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 z-50">
              <div className="rounded-3xl border border-gray-200/50 bg-white/95 backdrop-blur-xl shadow-2xl shadow-blue-500/10 dark:border-gray-700/50 dark:bg-gray-900/95 overflow-hidden p-4">
                <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                  {categories.map(category => (
                    <Link 
                      key={category.slug} 
                      to={category.path} 
                      className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-2xl hover:bg-blue-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <Link 
            to="/blog" 
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all active:scale-95"
          >
            Blog
          </Link>
        </nav>

        {/* Desktop Search */}
        <div className="relative hidden justify-end px-4 md:flex lg:flex-none">
          <div className="relative w-full max-w-xs xl:max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-2xl border-0 bg-gray-100/50 py-2.5 pl-11 pr-4 text-sm text-gray-900 ring-1 ring-inset ring-gray-200/50 placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-600 dark:bg-gray-800/50 dark:text-white dark:ring-gray-700/50 dark:focus:ring-blue-500 transition-all duration-300 shadow-sm focus:shadow-blue-500/10 focus:shadow-lg"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearch(true)}
              onBlur={() => setTimeout(() => setShowSearch(false), 200)}
            />
            {showSearch && searchQuery && (
              <div className="absolute top-full mt-3 w-full overflow-hidden rounded-3xl border border-gray-200/50 bg-white/95 backdrop-blur-xl shadow-2xl shadow-blue-500/10 dark:border-gray-700/50 dark:bg-gray-900/95 z-50 p-2">
                {filteredTools.length > 0 ? (
                  filteredTools.map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => navigate(`/tools/${tool.slug}`)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{tool.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-4 text-sm text-gray-500 text-center font-medium italic">No tools found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="rounded-xl p-2.5 text-gray-500 hover:bg-gray-100 transition-all dark:text-gray-400 dark:hover:bg-gray-800 hover:rotate-12 active:scale-95"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-xl p-2.5 text-gray-500 hover:bg-gray-100 md:hidden dark:text-gray-400 dark:hover:bg-gray-800 transition-all active:scale-95"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <Link
            to="/"
            className="hidden rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] px-6 py-2.5 text-sm font-black text-white shadow-xl shadow-blue-500/20 transition-all hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 md:block"
          >
            All Tools
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-gray-200 bg-white p-4 md:hidden dark:border-gray-800 dark:bg-gray-900">
          <nav aria-label="Mobile Navigation" className="space-y-1 mb-4 border-b border-gray-100 pb-4 dark:border-gray-800">
            <Link
              to="/"
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/blog"
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </Link>
          </nav>
          <div className="space-y-1 mb-4 border-b border-gray-100 pb-4 dark:border-gray-800">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Categories</p>
            {categories.map(category => (
              <Link
                key={category.slug}
                to={category.path}
                className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </div>
          <div className="space-y-1">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Popular Tools</p>
            {TOOLS.slice(0, 4).map(tool => (
              <Link
                key={tool.id}
                to={`/tools/${tool.slug}`}
                className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                {tool.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
