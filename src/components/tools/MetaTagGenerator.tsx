import React, { useState, useEffect } from 'react';
import { Copy, Check, RefreshCcw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export const MetaTagGenerator: React.FC = () => {
  const [title, setTitle] = useLocalStorage('meta-title', '');
  const [description, setDescription] = useLocalStorage('meta-description', '');
  const [keywords, setKeywords] = useLocalStorage('meta-keywords', '');
  const [author, setAuthor] = useLocalStorage('meta-author', '');
  const [imageUrl, setImageUrl] = useLocalStorage('meta-image-url', '');
  const [url, setUrl] = useLocalStorage('meta-url', '');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateTags();
  }, [title, description, keywords, author, imageUrl, url]);

  const generateTags = () => {
    let tags = `<!-- Primary Meta Tags -->\n`;
    if (title) tags += `<title>${title}</title>\n`;
    if (title) tags += `<meta name="title" content="${title}">\n`;
    if (description) tags += `<meta name="description" content="${description}">\n`;
    if (keywords) tags += `<meta name="keywords" content="${keywords}">\n`;
    if (author) tags += `<meta name="author" content="${author}">\n`;

    tags += `\n<!-- Open Graph / Facebook -->\n`;
    tags += `<meta property="og:type" content="website">\n`;
    if (url) tags += `<meta property="og:url" content="${url}">\n`;
    if (title) tags += `<meta property="og:title" content="${title}">\n`;
    if (description) tags += `<meta property="og:description" content="${description}">\n`;
    if (imageUrl) tags += `<meta property="og:image" content="${imageUrl}">\n`;

    tags += `\n<!-- Twitter -->\n`;
    tags += `<meta property="twitter:card" content="summary_large_image">\n`;
    if (url) tags += `<meta property="twitter:url" content="${url}">\n`;
    if (title) tags += `<meta property="twitter:title" content="${title}">\n`;
    if (description) tags += `<meta property="twitter:description" content="${description}">\n`;
    if (imageUrl) tags += `<meta property="twitter:image" content="${imageUrl}">\n`;

    setGeneratedCode(tags);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setTitle('');
    setDescription('');
    setKeywords('');
    setAuthor('');
    setImageUrl('');
    setUrl('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Meta Tag Details</h3>
            <button onClick={reset} className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1">
              <RefreshCcw className="h-4 w-4" /> Reset
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Site Title <span className={cn("text-xs float-right", title.length > 60 ? "text-red-500" : "text-gray-500")}>{title.length}/60</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="e.g., Sohelix - Free Online Tools"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Site Description <span className={cn("text-xs float-right", description.length > 160 ? "text-red-500" : "text-gray-500")}>{description.length}/160</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="e.g., A collection of free online tools for developers and creators."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Keywords (comma separated)</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="e.g., tools, online, free, seo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="e.g., John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Page URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="e.g., https://sohelix.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL (for social sharing)</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="e.g., https://sohelix.com/og-image.jpg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Google SERP Preview</h3>
          <div className="bg-white p-4 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="text-sm text-gray-800 dark:text-gray-200 mb-1 truncate">
              {url || 'https://example.com'}
            </div>
            <div className="text-xl text-blue-800 dark:text-blue-400 hover:underline cursor-pointer truncate mb-1">
              {title || 'Example Domain'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {description || 'This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.'}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Generated Meta Tags</h3>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <pre className="bg-gray-50 dark:bg-gray-950 p-4 rounded-lg overflow-x-auto text-sm text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-800">
            <code>{generatedCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
