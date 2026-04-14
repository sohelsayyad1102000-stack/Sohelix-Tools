import React, { useState } from 'react';
import { RefreshCcw, Smartphone, Monitor } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export const SerpPreview: React.FC = () => {
  const [title, setTitle] = useLocalStorage('serp-title', '');
  const [url, setUrl] = useLocalStorage('serp-url', '');
  const [description, setDescription] = useLocalStorage('serp-description', '');
  const [viewMode, setViewMode] = useLocalStorage<'desktop' | 'mobile'>('serp-view-mode', 'desktop');

  const reset = () => {
    setTitle('');
    setUrl('');
    setDescription('');
  };

  // Google typically truncates around 600px for title (approx 60 chars)
  // and 960px for description (approx 160 chars) on desktop
  const titleLength = title.length;
  const descLength = description.length;

  const isTitleTooLong = titleLength > 60;
  const isDescTooLong = descLength > 160;

  const displayTitle = isTitleTooLong ? title.substring(0, 60) + '...' : title || 'Example Domain - Your SEO Title Goes Here';
  const displayUrl = url || 'https://www.example.com › path › to › page';
  const displayDesc = isDescTooLong ? description.substring(0, 160) + '...' : description || 'This is an example of a meta description. It should be compelling and informative, encouraging users to click through to your website from the search results.';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Page Details</h3>
            <button onClick={reset} className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1">
              <RefreshCcw className="h-4 w-4" /> Reset
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                SEO Title <span className={cn("text-xs float-right", isTitleTooLong ? "text-red-500" : "text-gray-500")}>{titleLength}/60</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Enter your page title"
              />
              {isTitleTooLong && <p className="text-xs text-red-500 mt-1">Title is likely to be truncated by Google.</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL / Breadcrumb</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Meta Description <span className={cn("text-xs float-right", isDescTooLong ? "text-red-500" : "text-gray-500")}>{descLength}/160</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Enter your meta description"
              />
              {isDescTooLong && <p className="text-xs text-red-500 mt-1">Description is likely to be truncated by Google.</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Live Preview</h3>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('desktop')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  viewMode === 'desktop' ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                )}
              >
                <Monitor className="h-4 w-4" /> Desktop
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  viewMode === 'mobile' ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                )}
              >
                <Smartphone className="h-4 w-4" /> Mobile
              </button>
            </div>
          </div>

          <div className={cn(
            "bg-white dark:bg-[#202124] border border-gray-200 dark:border-gray-700 rounded-lg p-4 mx-auto",
            viewMode === 'mobile' ? "max-w-[375px]" : "max-w-[600px]"
          )}>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[#202124] dark:text-[#dadce0] text-sm">
                <div className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs">🌐</div>
                <div className="flex flex-col">
                  <span className="truncate max-w-[280px]">{displayUrl.split(' ')[0]}</span>
                  <span className="text-xs text-[#4d5156] dark:text-[#bdc1c6] truncate max-w-[280px]">{displayUrl}</span>
                </div>
              </div>
              <h3 className="text-[20px] leading-[1.3] text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer pt-1">
                {displayTitle}
              </h3>
              <div className="text-[14px] leading-[1.58] text-[#4d5156] dark:text-[#bdc1c6] pt-1 break-words">
                {displayDesc}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
