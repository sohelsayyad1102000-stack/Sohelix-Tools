import React, { useState, useEffect } from 'react';
import { Copy, Check, RefreshCcw } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it', 'no', 'not', 'of', 'on', 'or', 'such', 'that', 'the', 'their', 'then', 'there', 'these', 'they', 'this', 'to', 'was', 'will', 'with'
]);

export const SlugGenerator: React.FC = () => {
  const [text, setText] = useLocalStorage('slug-text', '');
  const [slug, setSlug] = useState('');
  const [removeStopWords, setRemoveStopWords] = useLocalStorage('slug-remove-stop-words', true);
  const [lowercase, setLowercase] = useLocalStorage('slug-lowercase', true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateSlug();
  }, [text, removeStopWords, lowercase]);

  const generateSlug = () => {
    if (!text) {
      setSlug('');
      return;
    }

    let processedText = text;

    if (lowercase) {
      processedText = processedText.toLowerCase();
    }

    // Remove special characters and replace spaces with hyphens
    processedText = processedText
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove non-alphanumeric except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen

    if (removeStopWords) {
      const words = processedText.split('-');
      const filteredWords = words.filter(word => !STOP_WORDS.has(word.toLowerCase()));
      processedText = filteredWords.join('-');
    }

    // Remove leading/trailing hyphens
    processedText = processedText.replace(/^-+|-+$/g, '');

    setSlug(processedText);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setText('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Input Text</h3>
            <button onClick={reset} className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1">
              <RefreshCcw className="h-4 w-4" /> Reset
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Text to convert</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Enter your title or text here..."
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeStopWords}
                  onChange={(e) => setRemoveStopWords(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Remove stop words (a, an, the, etc.)</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lowercase}
                  onChange={(e) => setLowercase(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Force lowercase</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Generated Slug</h3>
            <button
              onClick={copyToClipboard}
              disabled={!slug}
              className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100 disabled:opacity-50 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy Slug'}
            </button>
          </div>
          <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-lg border border-gray-200 dark:border-gray-800 min-h-[100px] flex items-center break-all">
            <span className="text-lg font-mono text-gray-800 dark:text-gray-200">
              {slug || <span className="text-gray-400 dark:text-gray-600 italic">Your slug will appear here...</span>}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
