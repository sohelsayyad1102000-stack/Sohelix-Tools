import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { TOOLS } from '../constants/tools';
import { CATEGORY_INFO } from '../constants/categories';
import { ToolCard } from '../components/ToolCard';
import { ChevronRight } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const categoryInfo = slug && CATEGORY_INFO[slug] ? CATEGORY_INFO[slug] : null;
  const categoryTools = TOOLS.filter(tool => tool.category === slug);

  if (!categoryInfo || categoryTools.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Category Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">The category you are looking for does not exist or has no tools yet.</p>
        <Link to="/" className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition-all hover:bg-blue-700">
          Back to Home
        </Link>
      </div>
    );
  }

  const Icon = categoryInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <SEO
        title={categoryInfo.title}
        description={categoryInfo.description}
      />

      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-gray-900 dark:text-white">
            {categoryInfo.title.replace('Free ', '').replace(' Online', '')}
          </span>
        </nav>

        {/* Category Header & SEO Content */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-6 text-blue-600 dark:text-blue-400">
            <Icon className="h-10 w-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            {categoryInfo.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            {categoryInfo.content}
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </div>
  );
};
