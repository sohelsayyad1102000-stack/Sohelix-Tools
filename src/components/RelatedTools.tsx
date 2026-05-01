import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getRelatedTools } from '../lib/seo';
import { DynamicIcon } from './DynamicIcon';

interface RelatedToolsProps {
  currentToolId: string;
  category: string;
  categoryName: string;
}

export const RelatedTools: React.FC<RelatedToolsProps> = ({
  currentToolId,
  category,
  categoryName
}) => {
  const related = getRelatedTools(currentToolId, category);

  if (related.length === 0) return null;

  return (
    <div className="mt-16 border-t border-gray-100 pt-16 dark:border-gray-800">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Related {categoryName}</h2>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Discover more tools to help with your workflow</p>
        </div>
        <Link 
          to={`/categories/${category}/`}
          className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          View All <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {related.map((tool) => (
          <Link
            key={tool.id}
            to={`/tools/${tool.slug}/`}
            className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-900/50"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-900/20 dark:text-blue-400">
              <DynamicIcon name={tool.icon} className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-blue-600 dark:text-white transition-colors">{tool.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{tool.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
