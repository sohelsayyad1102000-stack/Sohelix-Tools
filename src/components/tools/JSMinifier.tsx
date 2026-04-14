import React, { useState, useEffect } from 'react';
import { 
  Code, 
  RefreshCcw, 
  Copy, 
  CheckCircle2, 
  Download, 
  Zap,
  ArrowRight,
  Settings2,
  AlertCircle
} from 'lucide-react';
import { cn, formatBytes } from '../../lib/utils';
import { minify } from 'terser';

export const JSMinifier: React.FC = () => {
  const [input, setInput] = useState('// JavaScript Example\nfunction greet(name) {\n  const message = "Hello, " + name + "!";\n  console.log(message);\n  return message;\n}\n\ngreet("Sohelix User");');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [options, setOptions] = useState({
    mangle: true,
    compress: true,
    toplevel: false
  });

  useEffect(() => {
    minifyJS();
  }, [input, options]);

  const minifyJS = async () => {
    if (!input.trim()) {
      setOutput('');
      setError(null);
      return;
    }

    setIsProcessing(true);
    try {
      const result = await minify(input, {
        mangle: options.mangle,
        compress: options.compress,
        toplevel: options.toplevel
      });
      setOutput(result.code || '');
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setOutput('');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJS = () => {
    const blob = new Blob([output], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minified-${Date.now()}.js`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reduction = input.length > 0 && output.length > 0 ? ((input.length - output.length) / input.length * 100).toFixed(1) : 0;

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
              <p className="text-sm text-gray-500">Advanced Terser settings</p>
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
                  {key}
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
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Source JavaScript</h3>
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
            placeholder="Paste your JavaScript here..."
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
                disabled={!output || isProcessing}
                onClick={copyResult}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30"
              >
                {copied ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-gray-400" />}
              </button>
              <button 
                disabled={!output || isProcessing}
                onClick={downloadJS}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30"
              >
                <Download className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
          <div className="relative h-[348px] rounded-3xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950 overflow-hidden shadow-inner">
            {error ? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Minification Error</h4>
                <p className="text-sm text-red-600 mt-2">{error}</p>
              </div>
            ) : isProcessing ? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <RefreshCcw className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                <p className="text-sm text-gray-500">Optimizing code...</p>
              </div>
            ) : (
              <pre className="h-full p-6 text-xs font-mono text-blue-600 dark:text-blue-400 overflow-auto whitespace-pre-wrap break-all">
                {output || <span className="text-gray-400 italic">Minified JS will appear here...</span>}
              </pre>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {output && !error && (
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
              <h4 className="font-bold">Advanced Terser</h4>
              <p className="text-xs text-gray-400">Industry standard optimization</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
