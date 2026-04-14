import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TOOLS } from '../constants/tools';
import { ToolCard } from '../components/ToolCard';
import { SEO } from '../components/SEO';
import { motion } from 'motion/react';
import { Shield, Zap, Lock, MousePointer2, Search } from 'lucide-react';

export const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredTools = useMemo(() => {
    return TOOLS.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <SEO
        title="Free Online Image Tools - Compress, Resize, Crop & More"
        description="Sohelix offers a suite of 50+ professional image tools. 100% free, secure, and client-side. No upload required. Optimize your images for the web instantly."
        keywords={['image tools', 'online image editor', 'free image compressor', 'resize image online', 'sohelix']}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(37,99,235,0.1)_0%,transparent_100%)]" />
        
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/20 dark:text-blue-400">
              <Zap className="mr-1.5 h-3.5 w-3.5 fill-current" />
              100% Client-Side Processing
            </span>
            <h1 className="mt-8 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-7xl dark:text-white">
              Free Online Image Tools <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Optimized for Speed
              </span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-400">
              The fastest way to compress, resize, and convert images without uploading them to any server. 
              Your privacy is our priority.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="#tools"
                className="rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-blue-500/30 transition-all hover:bg-blue-700 hover:scale-105"
              >
                Explore All Tools
              </a>
              <div className="flex -space-x-2 overflow-hidden">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-gray-950"
                    src={`https://picsum.photos/seed/user${i}/100/100`}
                    alt="User"
                    referrerPolicy="no-referrer"
                  />
                ))}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 ring-2 ring-white dark:bg-gray-800 dark:ring-gray-950">
                  <span className="text-xs font-medium text-gray-500">+10k</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-gray-200 bg-white py-8 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="flex items-center justify-center gap-3">
              <Lock className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">100% Secure</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Privacy First</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Zap className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Instant Results</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <MousePointer2 className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">No Signup</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section id="tools" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Our Free Tools</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Everything you need in one place.</p>
          </div>
          
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex overflow-x-auto pb-2 md:pb-0 hide-scrollbar gap-2">
              {['All', 'image-tools', 'pdf-tools', 'calculator-tools', 'finance-tools', 'seo-tools', 'text-tools', 'utilities', 'misc'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {cat === 'All' ? 'All Tools' : cat.replace('-tools', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) + ' Tools'}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-72 shrink-0">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-full border-0 bg-white py-2.5 pl-10 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-900 dark:text-white dark:ring-gray-700 dark:focus:ring-blue-500"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {filteredTools.length > 0 ? (
          <div className="space-y-16">
            {['image-tools', 'pdf-tools', 'calculator-tools', 'finance-tools', 'seo-tools', 'text-tools', 'utilities', 'misc'].map((categorySlug) => {
              const categoryTools = filteredTools.filter(t => t.category === categorySlug);
              if (categoryTools.length === 0) return null;
              
              const categoryTitles: Record<string, string> = {
                'image-tools': 'Image Tools',
                'pdf-tools': 'PDF Tools',
                'calculator-tools': 'Calculator Tools',
                'finance-tools': 'Finance Tools',
                'seo-tools': 'SEO Tools',
                'text-tools': 'Text Tools',
                'utilities': 'Utility Tools',
                'misc': 'Miscellaneous Tools'
              };

              return (
                <div key={categorySlug}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{categoryTitles[categorySlug]}</h3>
                    <Link to={`/categories/${categorySlug}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                      View All &rarr;
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {categoryTools.map((tool) => (
                      <ToolCard key={tool.id} tool={tool} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">No tools found</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              We couldn't find any tools matching "{searchQuery}". Try a different search term.
            </p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-6 rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Clear Search
            </button>
          </div>
        )}
      </section>

      {/* SEO Content Section */}
      <section className="bg-white py-24 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why Choose Sohelix for Your Image Needs?</h2>
          <div className="mt-8 prose prose-blue dark:prose-invert max-w-none">
            <p>
              In the digital age, images are the backbone of visual communication. However, managing image files can be a challenge. 
              Whether it's a large JPG slowing down your website or a PNG that needs to be converted to WebP for better SEO, 
              you need tools that are fast, reliable, and secure.
            </p>
            <p>
              Sohelix was built with a simple mission: to provide professional-grade image tools that respect your privacy. 
              Unlike other platforms that upload your files to their servers, Sohelix processes everything right in your browser. 
              This means your sensitive data never leaves your device, and you get instant results without waiting for uploads or downloads.
            </p>
            <h3>The Power of Client-Side Processing</h3>
            <p>
              By leveraging modern browser APIs like Canvas and WebAssembly, we bring the power of desktop software to your web browser. 
              Our tools are optimized for performance, ensuring that even large batch operations are handled smoothly. 
              This architecture also makes Sohelix incredibly scalable and resilient, providing a consistent experience regardless of server load.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
