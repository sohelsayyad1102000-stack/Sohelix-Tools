import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Tool } from '../types';
import { motion } from 'motion/react';

interface ToolCardProps {
  tool: Tool;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const IconComponent = (Icons as any)[tool.icon] || Icons.FileImage;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-xl dark:border-gray-800 dark:bg-gray-800 dark:hover:border-blue-900"
    >
      <Link to={`/tools/${tool.slug}`} className="absolute inset-0 z-10" />
      
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-900/20 dark:text-blue-400">
        <IconComponent className="h-6 w-6" />
      </div>

      <div className="flex items-center gap-2">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{tool.name}</h3>
        {tool.isNew && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-600 dark:bg-green-900/30 dark:text-green-400">
            New
          </span>
        )}
      </div>
      
      <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        {tool.description}
      </p>

      <div className="mt-6 flex items-center text-sm font-semibold text-blue-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-blue-400">
        Try Now
        <Icons.ArrowRight className="ml-1 h-4 w-4" />
      </div>
    </motion.div>
  );
};
