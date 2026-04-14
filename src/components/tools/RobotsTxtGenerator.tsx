import React, { useState, useEffect } from 'react';
import { Copy, Check, Download, RefreshCcw } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export const RobotsTxtGenerator: React.FC = () => {
  const [userAgent, setUserAgent] = useLocalStorage('robots-user-agent', '*');
  const [allow, setAllow] = useLocalStorage('robots-allow', '/');
  const [disallow, setDisallow] = useLocalStorage('robots-disallow', '');
  const [sitemap, setSitemap] = useLocalStorage('robots-sitemap', '');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateRobotsTxt();
  }, [userAgent, allow, disallow, sitemap]);

  const generateRobotsTxt = () => {
    let txt = `User-agent: ${userAgent}\n`;
    
    if (allow) {
        const allowPaths = allow.split('\\n').filter(p => p.trim() !== '');
        allowPaths.forEach(path => {
            txt += `Allow: ${path.trim()}\n`;
        });
    }

    if (disallow) {
        const disallowPaths = disallow.split('\\n').filter(p => p.trim() !== '');
        disallowPaths.forEach(path => {
            txt += `Disallow: ${path.trim()}\n`;
        });
    }

    if (sitemap) {
      txt += `\nSitemap: ${sitemap}\n`;
    }

    setGeneratedCode(txt);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setUserAgent('*');
    setAllow('/');
    setDisallow('');
    setSitemap('');
  };

  const applyTemplate = (type: string) => {
    setUserAgent('*');
    if (type === 'wordpress') {
      setAllow('/');
      setDisallow('/wp-admin/\\n/wp-includes/');
    } else if (type === 'shopify') {
      setAllow('/');
      setDisallow('/admin/\\n/cart/\\n/orders/\\n/checkout/\\n/account/');
    } else if (type === 'default') {
      setAllow('/');
      setDisallow('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Robots.txt Rules</h3>
            <button onClick={reset} className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1">
              <RefreshCcw className="h-4 w-4" /> Reset
            </button>
          </div>

          <div className="mb-6 flex gap-2 flex-wrap">
            <button onClick={() => applyTemplate('default')} className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">Default</button>
            <button onClick={() => applyTemplate('wordpress')} className="text-xs px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50">WordPress</button>
            <button onClick={() => applyTemplate('shopify')} className="text-xs px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50">Shopify</button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User-Agent</label>
              <select
                value={userAgent}
                onChange={(e) => setUserAgent(e.target.value)}
                className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="*">* (All Robots)</option>
                <option value="Googlebot">Googlebot</option>
                <option value="Googlebot-Image">Googlebot-Image</option>
                <option value="Bingbot">Bingbot</option>
                <option value="Slurp">Yahoo Slurp</option>
                <option value="DuckDuckBot">DuckDuckBot</option>
                <option value="Baiduspider">Baiduspider</option>
                <option value="YandexBot">YandexBot</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allow (One path per line)</label>
              <textarea
                value={allow}
                onChange={(e) => setAllow(e.target.value)}
                rows={3}
                className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white font-mono"
                placeholder="/"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Disallow (One path per line)</label>
              <textarea
                value={disallow}
                onChange={(e) => setDisallow(e.target.value)}
                rows={3}
                className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white font-mono"
                placeholder="/private/\n/admin/"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sitemap URL (Optional)</label>
              <input
                type="url"
                value={sitemap}
                onChange={(e) => setSitemap(e.target.value)}
                className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="https://example.com/sitemap.xml"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Generated robots.txt</h3>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={downloadTxt}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
          <pre className="bg-gray-50 dark:bg-gray-950 p-4 rounded-lg overflow-x-auto text-sm text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-800 font-mono">
            <code>{generatedCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
