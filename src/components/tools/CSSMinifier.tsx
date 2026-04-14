import React, { useState, useEffect } from 'react';
import { 
  Code, 
  RefreshCcw, 
  Copy, 
  CheckCircle2, 
  Download, 
  Zap,
  ArrowRight,
  Settings2
} from 'lucide-react';
import { cn, formatBytes } from '../../lib/utils';

export const CSSMinifier: React.FC = () => {
  const [input, setInput] = useState('/* Main Styles */\n.container {\n  width: 100%;\n  padding: 20px;\n  margin: 0 auto;\n}\n\n.button {\n  background-color: #2563eb;\n  color: #ffffff;\n  border-radius: 8px;\n  padding: 10px 20px;\n  border: none;\n  cursor: pointer;\n}\n\n.button:hover {\n  background-color: #1d4ed8;\n}');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    removeComments: true,
    removeWhitespace: true,
    removeLastSemicolon: true,
    shortenColors: true
  });

  useEffect(() => {
    minifyCSS();
  }, [input, options]);

  const minifyCSS = () => {
    if (!input.trim()) {
      setOutput('');
      return;
    }

    let minified = input;

    if (options.removeComments) {
      minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
    }

    if (options.removeWhitespace) {
      minified = minified.replace(/\s+/g, ' ');
      minified = minified.replace(/\s*([\{\}:;,])\s*/g, '$1');
      minified = minified.replace(/\s+(!important)/g, '$1');
      minified = minified.trim();
    }

    if (options.removeLastSemicolon) {
      minified = minified.replace(/;}/g, '}');
    }

    if (options.shortenColors) {
      // Basic color shortening (e.g., #ffffff -> #fff)
      minified = minified.replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3(?![0-9a-f])/gi, '#$1$2$3');
    }

    setOutput(minified);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCSS = () => {
    const blob = new Blob([output], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minified-${Date.now()}.css`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reduction = input.length > 0 ? ((input.length - output.length) / input.length * 100).toFixed(1) : 0;

  return (
    <div className="space-y-8">
      {/* Options */}
      <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20">
              <Settings2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Minification Options</h3>
              <p className="text-sm text-gray-500">Optimize your CSS output</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-6">
            {Object.entries(options).map(([key, value]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={value}
                    onChange={() => setOptions(prev => ({ ...prev, [key]: !value }))}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 bg-white transition-all checked:border-blue-600 checked:bg-blue-600 dark:border-gray-700 dark:bg-gray-800"
                  />
                  <CheckCircle2 className="absolute left-0.5 top-0.5 h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                </div>
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Source CSS</h3>
            <button 
              onClick={() => setInput('')}
              className="text-xs font-bold text-red-600 hover:underline"
            >
              Clear
            </button>
          </div>
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your CSS here..."
            rows={15}
            className="block w-full rounded-3xl border-gray-200 bg-white px-6 py-6 text-sm font-mono focus:border-blue-500 focus:ring-blue-500 dark:border-gray-800 dark:bg-gray-900 shadow-sm"
          />
        </div>

        {/* Output */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Minified Result</h3>
            <div className="flex gap-2">
              <button 
                disabled={!output}
                onClick={copyResult}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30"
              >
                {copied ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-gray-400" />}
              </button>
              <button 
                disabled={!output}
                onClick={downloadCSS}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30"
              >
                <Download className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
          <div className="relative h-[348px] rounded-3xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950 overflow-hidden shadow-inner">
            <pre className="h-full p-6 text-xs font-mono text-blue-600 dark:text-blue-400 overflow-auto whitespace-pre-wrap break-all">
              {output || <span className="text-gray-400 italic">Minified CSS will appear here...</span>}
            </pre>
          </div>
        </div>
      </div>

      {/* Stats */}
      {output && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Original Size</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{formatBytes(input.length)}</p>
            </div>
            <ArrowRight className="h-6 w-6 text-gray-300" />
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Minified Size</p>
              <p className="text-2xl font-black text-blue-600">{formatBytes(output.length)}</p>
            </div>
          </div>

          <div className="rounded-3xl bg-blue-600 p-8 text-white shadow-xl shadow-blue-500/20 flex flex-col justify-center">
            <p className="text-xs font-bold text-blue-100 uppercase tracking-wider mb-1">Total Reduction</p>
            <p className="text-4xl font-black">{reduction}%</p>
          </div>

          <div className="rounded-3xl bg-gray-900 p-8 text-white shadow-xl flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gray-800">
              <Zap className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <h4 className="font-bold">Fast & Secure</h4>
              <p className="text-xs text-gray-400">Processed 100% in your browser</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
