import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TOOLS } from '../constants/tools';
import { BLOG_POSTS } from '../constants/blog';
import { ToolCard } from '../components/ToolCard';
import { SEO } from '../components/SEO';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Zap, 
  Lock, 
  MousePointer2, 
  Search, 
  History, 
  ChevronRight, 
  Star, 
  Clock, 
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  LayoutGrid,
  Image as ImageIcon,
  FileText,
  Type,
  Settings,
  Calculator,
  TrendingUp,
  MoreHorizontal,
  BookOpen,
  Calendar
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '../lib/utils';

import { useToolHistory } from '../hooks/useToolHistory';

export const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { history } = useToolHistory();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredTools = useMemo(() => {
    return TOOLS.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const categories = [
    { id: 'All', name: 'All Tools', icon: LayoutGrid },
    { id: 'image-tools', name: 'Image Tools', icon: ImageIcon },
    { id: 'pdf-tools', name: 'PDF Tools', icon: FileText },
    { id: 'text-tools', name: 'Text Tools', icon: Type },
    { id: 'seo-tools', name: 'SEO Tools', icon: Search },
    { id: 'utilities', name: 'Utility Tools', icon: Settings },
    { id: 'calculator-tools', name: 'Calculators', icon: Calculator },
    { id: 'finance-tools', name: 'Finance', icon: TrendingUp },
  ];

  const searchSuggestions = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    
    const matchedCategories = categories.filter(cat => 
      cat.id !== 'All' && cat.name.toLowerCase().includes(query)
    ).map(cat => ({ ...cat, type: 'category' }));

    const matchedTools = TOOLS.filter(tool => 
      tool.name.toLowerCase().includes(query)
    ).slice(0, 6).map(tool => ({ ...tool, type: 'tool' }));

    return [...matchedCategories, ...matchedTools].slice(0, 8);
  }, [searchQuery, categories]);

  const popularTools = useMemo(() => {
    const popularIds = ['compress-image', 'pdf-to-jpg', 'qr-code-generator', 'resize-image', 'merge-pdf', 'age-calculator'];
    return TOOLS.filter(t => popularIds.includes(t.id));
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <SEO
        title="Sohelix - Free Online Tools for Everyone (60+ Tools)"
        description="Access 60+ powerful, free online tools for images, PDFs, SEO, and more. 100% secure, client-side processing. No signup required."
        keywords={['free online tools', 'image tools', 'pdf tools', 'seo tools', 'sohelix', 'tinywow alternative']}
        ogImage="https://sohelix.com/og/default.png"
      />

      {/* Hero Section */}
      <section className="relative bg-gray-50 dark:bg-gray-900/50 px-4 py-24 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(37,99,235,0.05)_0%,transparent_100%)]" />
        
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 text-sm font-semibold text-blue-700 dark:text-blue-400 mb-8">
              <Star className="h-4 w-4 fill-current" />
              60+ Free Tools Available • No Signup Required • Fast & Secure
            </div>
            
            <h1 className="text-5xl font-black tracking-tight text-gray-900 sm:text-7xl dark:text-white mb-6">
              Free Online Tools <br />
              <span className="text-blue-600">for Everyone</span>
            </h1>
            
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
              Access 60+ powerful tools for images, PDFs, SEO, and more. 
              Fast, secure, and 100% private.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto" ref={searchRef}>
              <div className={cn(
                "relative flex items-center transition-all duration-300",
                isSearchFocused ? "scale-105" : "scale-100"
              )}>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-3xl border-0 bg-white dark:bg-gray-800 py-6 pl-16 pr-6 text-lg text-gray-900 dark:text-white shadow-2xl ring-1 ring-inset ring-gray-200 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 outline-none"
                  placeholder="Search 60+ tools (e.g. compress, pdf, qr)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                />
              </div>

              {/* Suggestions Dropdown */}
              <AnimatePresence initial={false}>
                {isSearchFocused && searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-4 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
                  >
                    <div className="p-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-2">Suggestions</p>
                      {searchSuggestions.length > 0 ? (
                        searchSuggestions.map((item: any) => {
                          const IconComponent = item.type === 'category' ? item.icon : ((Icons as any)[item.icon] || Icons.FileImage);
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                if (item.type === 'category') {
                                  setActiveCategory(item.id);
                                  setSearchQuery('');
                                  const el = document.getElementById('tools');
                                  el?.scrollIntoView({ behavior: 'smooth' });
                                } else {
                                  navigate(`/tools/${item.slug}`);
                                }
                              }}
                              className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl transition-colors group"
                            >
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white">
                                  {item.name}
                                  {item.type === 'category' && <span className="ml-2 text-[10px] font-bold uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">Category</span>}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {item.type === 'category' ? `Browse all ${item.name}` : item.category.replace('-', ' ')}
                                </p>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <p className="text-gray-500">No tools found for "{searchQuery}"</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sticky Search Bar */}
      <AnimatePresence initial={false}>
        {isSticky && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-[60] bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 py-3 px-4 shadow-lg"
          >
            <div className="max-w-7xl mx-auto flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Zap className="h-5 w-5 fill-current" />
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">Sohelix</span>
              </Link>
              <div className="relative flex-1 max-w-2xl mx-auto">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-full border-0 bg-gray-100 dark:bg-gray-800 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-blue-600 outline-none"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="hidden md:flex items-center gap-4 shrink-0">
                {categories.slice(1, 4).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      const el = document.getElementById('tools');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trust Stats Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.03),transparent_40%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { label: 'Free Tools', value: '60+', icon: LayoutGrid, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { label: 'Secure', value: '100%', icon: Shield, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
              { label: 'Signups', value: '0', icon: Lock, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
              { label: 'Usage', value: '∞', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center transition-all hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1"
              >
                <div className={cn(
                  "mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 group-hover:rotate-3",
                  stat.bg,
                  stat.color
                )}>
                  <stat.icon className="h-7 w-7" />
                </div>
                <div className="text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Used */}
      {history.length > 0 && searchQuery === '' && activeCategory === 'All' && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <Clock className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Recently Used</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {history.map((item) => {
              const tool = TOOLS.find(t => t.id === item.id);
              if (!tool) return null;
              const IconComponent = (Icons as any)[tool.icon] || Icons.FileImage;
              return (
                <Link 
                  key={item.id}
                  to={`/tools/${item.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-900/50"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-gray-800 dark:text-gray-400">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{tool.name}</h3>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">Used {new Date(item.timestamp).toLocaleDateString()}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Popular Tools */}
      {searchQuery === '' && activeCategory === 'All' && (
        <section className="bg-gray-50 dark:bg-gray-900/30 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                  <Star className="h-5 w-5" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Popular Tools</h2>
              </div>
              <button 
                onClick={() => {
                  const el = document.getElementById('tools');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
              >
                Explore All <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {popularTools.map(tool => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Tabs & Tools Grid */}
      <section id="tools" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Explore All Tools</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Browse our collection of 60+ professional tools organized by category.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map(cat => {
            const IconComponent = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all",
                  activeCategory === cat.id
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30 scale-105"
                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900"
                )}
              >
                <IconComponent className="h-4 w-4" />
                {cat.name}
              </button>
            );
          })}
        </div>
        
        {filteredTools.length > 0 ? (
          <div className="space-y-24">
            {categories.slice(1).map((cat) => {
              if (activeCategory !== 'All' && activeCategory !== cat.id) return null;
              const categoryTools = filteredTools.filter(t => t.category === cat.id);
              if (categoryTools.length === 0) return null;
              
              const IconComponent = cat.icon;

              return (
                <div key={cat.id} className="scroll-mt-24">
                  <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-900 text-blue-600 dark:text-blue-400">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-2xl font-black text-gray-900 dark:text-white">{cat.name}</h3>
                          <span className="rounded-full bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                            {categoryTools.length} tools
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Professional utilities for your daily workflow</p>
                      </div>
                    </div>
                    <Link to={`/categories/${cat.id}`} className="hidden sm:flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400">
                      View All <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {categoryTools.slice(0, activeCategory === 'All' ? 8 : undefined).map((tool) => (
                      <ToolCard key={tool.id} tool={tool} />
                    ))}
                  </div>
                  {activeCategory === 'All' && categoryTools.length > 8 && (
                    <div className="mt-12 text-center">
                      <Link 
                        to={`/categories/${cat.id}`}
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        View All {cat.name} <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-gray-100 p-6 dark:bg-gray-800 mb-6">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">No tools found</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              We couldn't find any tools matching "{searchQuery}". Try a different search term or browse categories.
            </p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-8 rounded-2xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-xl shadow-blue-500/30 hover:bg-blue-700"
            >
              Clear Search
            </button>
          </div>
        )}
      </section>

      {/* Latest from Blog */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Latest from Blog</h2>
          </div>
          <Link 
            to="/blog"
            className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
          >
            View All Posts <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {BLOG_POSTS.slice(0, 3).map(post => (
            <Link 
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group flex flex-col bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="p-8">
                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4">{post.category}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors">{post.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{post.description}</p>
                <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
                  <Calendar className="h-3 w-3" />
                  {post.date}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How to Use Section */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">How to Use Sohelix Tools</h2>
            <p className="text-gray-500 dark:text-gray-400">Three simple steps to professional results.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white text-2xl font-black mb-6 shadow-xl shadow-blue-500/30">1</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Select a Tool</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Choose from our 60+ tools using the search bar or by browsing categories like Image, PDF, or SEO tools.</p>
            </div>
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white text-2xl font-black mb-6 shadow-xl shadow-blue-500/30">2</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Upload & Process</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Upload your files. All processing happens locally in your browser, ensuring your data never leaves your device.</p>
            </div>
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white text-2xl font-black mb-6 shadow-xl shadow-blue-500/30">3</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Download Results</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Instantly download your optimized files. No waiting for server processing or email delivery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content & FAQ Section */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-blue dark:prose-invert max-w-none mb-24">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-8">Free Online Tools – All in One Place</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              Welcome to Sohelix, your ultimate destination for high-quality, free online tools. We understand that managing digital assets can be complex and expensive. That's why we've built a comprehensive platform featuring over 60 professional-grade utilities designed to streamline your workflow without costing a penny.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              Our platform is organized into logical categories to help you find exactly what you need. Our <strong>Image Tools</strong> allow you to compress, resize, and convert formats like JPG, PNG, and WebP instantly. For document management, our <strong>PDF Tools</strong> offer seamless merging, splitting, and conversion. Developers and marketers will find our <strong>SEO Tools</strong> and <strong>Utility Tools</strong> indispensable for daily tasks like UUID generation, code minification, and meta tag optimization.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              What sets Sohelix apart is our commitment to privacy and speed. By utilizing modern browser technologies, all our tools process your data 100% client-side. This means your sensitive files never leave your computer, providing a level of security that server-based alternatives simply cannot match. Experience the power of desktop software with the convenience of a web browser.
            </p>
          </div>

          <div className="space-y-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <HelpCircle className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Frequently Asked Questions</h2>
            </div>
            <div className="grid grid-cols-1 gap-8">
              <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Are the tools really free?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Yes, all 60+ tools on Sohelix are 100% free to use. There are no hidden fees, no subscriptions, and no limits on how many times you can use them.</p>
              </div>
              <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Is my data secure?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Absolutely. We use client-side processing, which means your files are processed locally in your browser and are never uploaded to our servers. Your privacy is our top priority.</p>
              </div>
              <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Do I need to create an account?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">No account or signup is required. You can start using any of our tools immediately without providing any personal information.</p>
              </div>
              <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Do the tools work on mobile devices?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Yes, Sohelix is fully responsive and optimized for all devices, including smartphones, tablets, and desktop computers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
