import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Tool } from '../types';
import { motion } from 'motion/react';
import { DynamicIcon } from './DynamicIcon';

interface ToolCardProps {
  tool: Tool;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  return (
    <motion.div
      whileHover={{ y: -8, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:border-blue-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-900/50"
    >
      <Link to={`/tools/${tool.slug}`} className="absolute inset-0 z-10" />
      
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-all group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-900/20 dark:text-blue-400">
        <DynamicIcon name={tool.icon} className="h-7 w-7" />
      </div>

      <div className="flex items-center gap-2">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{tool.name}</h3>
        {tool.isNew && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-600 dark:bg-green-900/30 dark:text-green-400">
            New
          </span>
        )}
      </div>
      
      <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">
        {tool.description}
      </p>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center text-sm font-bold text-blue-600 dark:text-blue-400">
          Use Tool
          <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
        <div className="h-1.5 w-1.5 rounded-full bg-gray-200 dark:bg-gray-700 group-hover:bg-blue-600 dark:group-hover:bg-blue-400 transition-colors" />
      </div>
    </motion.div>
  );
};
